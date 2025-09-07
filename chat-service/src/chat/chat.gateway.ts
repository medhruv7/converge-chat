import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { JoinChatDto } from '../dto/join-chat.dto';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds
  private socketUsers = new Map<string, string>(); // socketId -> userId

  constructor(private chatService: ChatService) {}

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
      const recentMessages = await this.chatService.getRecentMessages(chatId);
      
      // Format messages for frontend
      const formattedMessages = recentMessages.map(message => ({
        id: message.id,
        content: message.content,
        type: message.type,
        senderId: message.senderId,
        sender: message.sender ? {
          id: message.sender.id,
          firstName: message.sender.firstName,
          lastName: message.sender.lastName,
          email: message.sender.email,
          phoneNumber: message.sender.phoneNumber,
          isActive: message.sender.isActive,
          createdAt: message.sender.createdAt.toISOString(),
          updatedAt: message.sender.updatedAt.toISOString(),
        } : null,
        sequenceNumber: message.sequenceNumber,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
        chatId: message.chatId,
      }));
      
      // Send recent messages to the client
      client.emit('chat_history', {
        chatId,
        messages: formattedMessages,
      });

      // Notify other participants
      client.to(`chat:${chatId}`).emit('user_joined', {
        chatId,
        userId,
        message: `User joined the chat`,
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

      // Send message through service (handles database and Redis)
      const message = await this.chatService.sendMessage(sendMessageDto);

      // Broadcast message to all participants in the chat room
      this.server.to(`chat:${chatId}`).emit('new_message', {
        id: message.id,
        content: message.content,
        type: message.type,
        senderId: message.senderId,
        sender: message.sender ? {
          id: message.sender.id,
          firstName: message.sender.firstName,
          lastName: message.sender.lastName,
          email: message.sender.email,
          phoneNumber: message.sender.phoneNumber,
          isActive: message.sender.isActive,
          createdAt: message.sender.createdAt.toISOString(),
          updatedAt: message.sender.updatedAt.toISOString(),
        } : null,
        sequenceNumber: message.sequenceNumber,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
        chatId: message.chatId,
      });

      console.log(`Message sent in chat ${chatId} by user ${senderId}`);
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
        message: `User left the chat`,
      });

      console.log(`User ${userId} left chat ${chatId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Method to broadcast messages from Redis (for cross-instance communication)
  async broadcastMessage(chatId: string, message: any) {
    this.server.to(`chat:${chatId}`).emit('new_message', message);
  }

  // Method to get online users for a chat
  async getOnlineUsers(chatId: string): Promise<string[]> {
    const sockets = await this.server.in(`chat:${chatId}`).fetchSockets();
    return sockets.map(socket => this.socketUsers.get(socket.id)).filter(Boolean);
  }
}
