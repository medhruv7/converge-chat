import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
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
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRedis() private redis: Redis,
    private userService: UserService,
  ) {}

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const { participantIds, ...chatData } = createChatDto;
    
    // Verify all participants exist using UserService
    const participants = [];
    for (const participantId of participantIds) {
      try {
        const user = await this.userService.findById(participantId);
        participants.push(user);
      } catch (error) {
        throw new BadRequestException(`User with ID ${participantId} not found`);
      }
    }

    const chat = this.chatRepository.create({
      ...chatData,
      participants,
    });

    const savedChat = await this.chatRepository.save(chat);
    
    // Store chat in Redis for real-time access
    await this.redis.hset(`chat:${savedChat.id}`, {
      name: savedChat.name,
      type: savedChat.type,
      participantCount: participants.length.toString(),
    });

    return savedChat;
  }

  async getChats(userId: string): Promise<Chat[]> {
    return await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participant')
      .leftJoinAndSelect('chat.messages', 'message')
      .where('participant.id = :userId', { userId })
      .orderBy('chat.updatedAt', 'DESC')
      .getMany();
  }

  async getChatById(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participant')
      .leftJoinAndSelect('chat.messages', 'message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('chat.id = :chatId', { chatId })
      .andWhere('participant.id = :userId', { userId })
      .orderBy('message.createdAt', 'ASC')
      .getOne();

    if (!chat) {
      throw new NotFoundException('Chat not found or access denied');
    }

    return chat;
  }

  async joinChat(joinChatDto: JoinChatDto): Promise<Chat> {
    const { chatId, userId } = joinChatDto;

    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participant')
      .where('chat.id = :chatId', { chatId })
      .getOne();

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a participant
    const isParticipant = chat.participants.some(p => p.id === userId);
    if (isParticipant) {
      return chat;
    }

    // Add user to chat
    chat.participants.push(user);
    await this.chatRepository.save(chat);

    // Update Redis cache
    await this.redis.hincrby(`chat:${chatId}`, 'participantCount', 1);

    return chat;
  }

  async sendMessage(sendMessageDto: SendMessageDto): Promise<Message> {
    const { chatId, senderId, content, type = 'text' } = sendMessageDto;

    // Verify chat exists and user is participant
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participant')
      .where('chat.id = :chatId', { chatId })
      .andWhere('participant.id = :senderId', { senderId })
      .getOne();

    if (!chat) {
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

    // Load sender information
    const messageWithSender = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.id = :id', { id: savedMessage.id })
      .getOne();

    // Store message in Redis for real-time delivery
    await this.storeMessageInRedis(messageWithSender);

    // Publish message to Redis for cross-instance delivery
    await this.publishMessage(messageWithSender);

    return messageWithSender;
  }

  async getMessages(chatId: string, userId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    // Verify user has access to chat
    await this.getChatById(chatId, userId);

    return await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.chatId = :chatId', { chatId })
      .andWhere('message.isDeleted = false')
      .orderBy('message.sequenceNumber', 'ASC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  private async getNextSequenceNumber(chatId: string): Promise<number> {
    const key = `chat:${chatId}:sequence`;
    return await this.redis.incr(key);
  }

  private async storeMessageInRedis(message: Message): Promise<void> {
    const key = `chat:${message.chatId}:messages`;
    const messageData = JSON.stringify({
      id: message.id,
      content: message.content,
      type: message.type,
      senderId: message.senderId,
      senderName: `${message.sender.firstName} ${message.sender.lastName}`,
      sequenceNumber: message.sequenceNumber,
      createdAt: message.createdAt.toISOString(),
    });

    // Store in sorted set with sequence number as score for ordering
    await this.redis.zadd(key, message.sequenceNumber, messageData);
    
    // Keep only last 1000 messages in Redis
    await this.redis.zremrangebyrank(key, 0, -1001);
  }

  private async publishMessage(message: Message): Promise<void> {
    const channel = `chat:${message.chatId}:messages`;
    const messageData = {
      id: message.id,
      content: message.content,
      type: message.type,
      senderId: message.senderId,
      senderName: `${message.sender.firstName} ${message.sender.lastName}`,
      sequenceNumber: message.sequenceNumber,
      createdAt: message.createdAt.toISOString(),
      chatId: message.chatId,
    };

    await this.redis.publish(channel, JSON.stringify(messageData));
  }

  async getRecentMessages(chatId: string, limit: number = 50): Promise<Message[]> {
    // Get recent messages from database with full sender information
    return await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.chatId = :chatId', { chatId })
      .orderBy('message.sequenceNumber', 'ASC')
      .limit(limit)
      .getMany();
  }

  async subscribeToChat(chatId: string, callback: (message: any) => void): Promise<void> {
    const channel = `chat:${chatId}:messages`;
    const subscriber = this.redis.duplicate();
    await subscriber.subscribe(channel);
    
    subscriber.on('message', (channel, message) => {
      callback(JSON.parse(message));
    });
  }
}
