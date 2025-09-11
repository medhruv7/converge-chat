import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { CreateChatDto } from '../dto/create-chat.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { JoinChatDto } from '../dto/join-chat.dto';
import { UserService } from '../services/user.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRedis() private redis: Redis,
    private userService: UserService,
  ) {}

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const { participantIds, ...chatData } = createChatDto;
    
    // Verify all participants exist using UserService
    for (const participantId of participantIds) {
      try {
        await this.userService.findById(participantId);
      } catch (error) {
        throw new BadRequestException(`User with ID ${participantId} not found`);
      }
    }

    const chat = this.chatRepository.create({
      ...chatData,
      participantIds,
    });

    const savedChat = await this.chatRepository.save(chat);
    
    // Store chat in Redis for real-time access
    await this.redis.hset(`chat:${savedChat.id}`, {
      name: savedChat.name,
      type: savedChat.type,
      participantCount: participantIds.length.toString(),
    });

    // Notify all participants about the new chat via Redis pubsub
    await this.notifyNewChatToParticipants(savedChat);

    return savedChat;
  }

  async getChats(userId: string): Promise<Chat[]> {
    return await this.chatRepository
      .createQueryBuilder('chat')
      .where(':userId = ANY(chat.participantIds)', { userId })
      .leftJoinAndSelect('chat.messages', 'message')
      .orderBy('chat.updatedAt', 'DESC')
      .getMany();
  }

  async getChatById(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .where('chat.id = :chatId', { chatId })
      .andWhere(':userId = ANY(chat.participantIds)', { userId })
      .leftJoinAndSelect('chat.messages', 'message')
      .getOne();

    if (!chat) {
      throw new NotFoundException('Chat not found or access denied');
    }

    return chat;
  }

  async joinChat(joinChatDto: JoinChatDto): Promise<Chat> {
    const { chatId, userId } = joinChatDto;

    // Verify user exists
    await this.userService.findById(userId);

    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Check if user is already a participant
    const isParticipant = chat.participantIds?.includes(userId);
    if (isParticipant) {
      // User is already a participant, just return the chat (for WebSocket room joining)
      return chat;
    }

    // Add user to participants only if they're not already a participant
    chat.participantIds = chat.participantIds ? [...chat.participantIds, userId] : [userId];
    const updatedChat = await this.chatRepository.save(chat);

    // Update Redis cache
    await this.redis.hset(`chat:${chatId}`, {
      participantCount: chat.participantIds.length.toString(),
    });

    return updatedChat;
  }

  async sendMessage(sendMessageDto: SendMessageDto): Promise<Message> {
    const { chatId, senderId, content, type = 'text' } = sendMessageDto;

    // Verify chat exists and user is participant
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat || !chat.participantIds?.includes(senderId)) {
      throw new ForbiddenException('Chat not found or access denied');
    }

    // Get next sequence number for message ordering
    const sequenceNumber = await this.getNextSequenceNumber(chatId);

    const message = this.messageRepository.create({
      id: uuidv4(),
      content,
      type,
      chatId,
      senderId,
      sequenceNumber,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Store message in Redis for real-time delivery
    await this.storeMessageInRedis(savedMessage);

    // Publish message to Redis for cross-instance delivery
    await this.publishMessage(savedMessage);

    return savedMessage;
  }

  async getMessages(chatId: string, userId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    // Verify user has access to this chat
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat || !chat.participantIds?.includes(userId)) {
      throw new ForbiddenException('Chat not found or access denied');
    }

    return await this.messageRepository
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId })
      .andWhere('message.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('message.sequenceNumber', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();
  }

  private async getNextSequenceNumber(chatId: string): Promise<number> {
    const lastMessage = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId })
      .orderBy('message.sequenceNumber', 'DESC')
      .getOne();

    return lastMessage ? Number(lastMessage.sequenceNumber) + 1 : 1;
  }

  private async storeMessageInRedis(message: Message): Promise<void> {
    // Store in Redis sorted set for ordering
    await this.redis.zadd(
      `chat:${message.chatId}:messages`,
      message.sequenceNumber,
      JSON.stringify({
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt.toISOString(),
      })
    );
  }

  private async publishMessage(message: Message): Promise<void> {
    // Publish to Redis for cross-instance communication
    await this.redis.publish('chat:message', JSON.stringify({
      chatId: message.chatId,
      messageId: message.id,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      sequenceNumber: message.sequenceNumber,
      isEdited: message.isEdited,
      isDeleted: message.isDeleted,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    }));
  }

  private async notifyNewChatToParticipants(chat: Chat): Promise<void> {
    // Publish to Redis for cross-instance communication about new chat
    await this.redis.publish('chat:new_chat', JSON.stringify({
      chatId: chat.id,
      chatName: chat.name,
      chatDescription: chat.description,
      chatType: chat.type,
      participantIds: chat.participantIds,
      createdAt: chat.createdAt.toISOString(),
    }));
  }
}
