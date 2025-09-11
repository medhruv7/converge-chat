import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { ChatService } from './chat.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { JoinChatDto } from '../dto/join-chat.dto';
import { UserService } from '../services/user.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds
  private socketUsers = new Map<string, string>(); // socketId -> userId
  private redisSubscriber: Redis;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    @InjectRedis() private redis: Redis,
  ) {
    // Create a separate Redis connection for subscribing
    this.redisSubscriber = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  afterInit(server: Server) {
    console.log('ChatGateway initialized');
    // Subscribe to Redis channels for real-time notifications
    this.subscribeToRedisChannels();
  }

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    
    // Extract user ID from handshake (you might want to implement JWT auth here)
    const userId = client.handshake.query.userId as string;
    
    if (userId) {
      this.socketUsers.set(client.id, userId);
      
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);
      
      console.log(`User ${userId} connected with socket ${client.id}`);
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(client.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.socketUsers.delete(client.id);
      
      console.log(`User ${userId} disconnected socket ${client.id}`);
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @MessageBody() joinChatDto: JoinChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { chatId, userId } = joinChatDto;
      
      // Verify user is connected
      if (!this.socketUsers.has(client.id) || this.socketUsers.get(client.id) !== userId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Join the chat
      await this.chatService.joinChat(joinChatDto);
      
      // Join socket room for this chat
      await client.join(`chat:${chatId}`);
      
      // Get recent messages
      const recentMessages = await this.chatService.getMessages(chatId, userId, 50, 0);
      
      // Format messages for frontend - fetch user data for each message
      const formattedMessages = await Promise.all(
        recentMessages.map(async (message) => {
          let senderInfo = null;
          try {
            const sender = await this.userService.findById(message.senderId);
            senderInfo = {
              id: sender.id,
              firstName: sender.firstName,
              lastName: sender.lastName,
              email: sender.email,
              phoneNumber: sender.phoneNumber,
              isActive: sender.isActive,
              createdAt: sender.createdAt.toString(),
              updatedAt: sender.updatedAt.toString(),
            };
          } catch (error) {
            console.error(`Failed to fetch sender info for user ${message.senderId}:`, error);
          }

          return {
            id: message.id,
            content: message.content,
            type: message.type,
            senderId: message.senderId,
            sender: senderInfo,
            sequenceNumber: message.sequenceNumber,
            createdAt: message.createdAt.toISOString(),
            updatedAt: message.updatedAt.toISOString(),
            chatId: message.chatId,
          };
        })
      );

      client.emit('chat_joined', {
        chatId,
        messages: formattedMessages.reverse(), // Reverse to get chronological order
      });

      // Notify other participants that user joined
      client.to(`chat:${chatId}`).emit('user_joined', {
        chatId,
        userId,
      });

      console.log(`User ${userId} joined chat ${chatId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { senderId, chatId } = sendMessageDto;
      
      // Verify user is connected and authorized
      if (!this.socketUsers.has(client.id) || this.socketUsers.get(client.id) !== senderId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Send message through service (handles database and Redis pub/sub)
      const message = await this.chatService.sendMessage(sendMessageDto);

      console.log(`Message sent in chat ${chatId} by user ${senderId} - will be broadcast via Redis`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leave_chat')
  async handleLeaveChat(
    @MessageBody() data: { chatId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { chatId, userId } = data;
      
      // Verify user is connected
      if (!this.socketUsers.has(client.id) || this.socketUsers.get(client.id) !== userId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Leave socket room
      await client.leave(`chat:${chatId}`);
      
      // Notify other participants
      client.to(`chat:${chatId}`).emit('user_left', {
        chatId,
        userId,
      });

      console.log(`User ${userId} left chat ${chatId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  private subscribeToRedisChannels(): void {
    // Subscribe to both new chat and new message notifications
    this.redisSubscriber.subscribe('chat:new_chat', 'chat:message', (err) => {
      if (err) {
        console.error('Failed to subscribe to Redis channels:', err);
      } else {
        console.log('Subscribed to chat:new_chat and chat:message channels');
      }
    });

    // Handle Redis notifications
    this.redisSubscriber.on('message', (channel, message) => {
      try {
        const data = JSON.parse(message);
        
        if (channel === 'chat:new_chat') {
          this.handleNewChatNotification(data);
        } else if (channel === 'chat:message') {
          this.handleNewMessageNotification(data);
        }
      } catch (error) {
        console.error(`Failed to parse Redis message from channel ${channel}:`, error);
      }
    });
  }

  private handleNewChatNotification(chatData: any): void {
    const { chatId, chatName, chatDescription, chatType, participantIds, createdAt } = chatData;
    
    console.log(`Broadcasting new chat ${chatId} to participants:`, participantIds);

    // Broadcast to all participants
    participantIds.forEach((participantId: string) => {
      const userSocketSet = this.userSockets.get(participantId);
      if (userSocketSet) {
        userSocketSet.forEach(socketId => {
          this.server.to(socketId).emit('chat_created', {
            chat: {
              id: chatId,
              name: chatName,
              description: chatDescription,
              type: chatType,
              participantIds,
              isActive: true,
              messages: [],
              createdAt,
              updatedAt: createdAt,
            }
          });
        });
      }
    });
  }

  private async handleNewMessageNotification(messageData: any): Promise<void> {
    const { 
      chatId, 
      messageId, 
      senderId, 
      content, 
      type, 
      sequenceNumber, 
      isEdited, 
      isDeleted, 
      createdAt, 
      updatedAt 
    } = messageData;
    
    console.log(`Broadcasting message ${messageId} in chat ${chatId} from user ${senderId}`);

    // Fetch sender information
    let senderInfo = null;
    try {
      const sender = await this.userService.findById(senderId);
      senderInfo = {
        id: sender.id,
        firstName: sender.firstName,
        lastName: sender.lastName,
        email: sender.email,
        phoneNumber: sender.phoneNumber,
        isActive: sender.isActive,
        createdAt: sender.createdAt.toString(),
        updatedAt: sender.updatedAt.toString(),
      };
    } catch (error) {
      console.error(`Failed to fetch sender info for user ${senderId}:`, error);
    }

    // Broadcast message to all participants in the chat room on this instance
    this.server.to(`chat:${chatId}`).emit('new_message', {
      id: messageId,
      content: content,
      type: type,
      senderId: senderId,
      sender: senderInfo,
      sequenceNumber: sequenceNumber,
      isEdited: isEdited,
      isDeleted: isDeleted,
      createdAt: createdAt,
      updatedAt: updatedAt,
      chatId: chatId,
    });

    console.log(`Message ${messageId} broadcast to local WebSocket clients in chat ${chatId}`);
  }
}
