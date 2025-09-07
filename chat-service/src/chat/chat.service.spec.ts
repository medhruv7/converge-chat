import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getRedisToken } from '@nestjs-modules/ioredis';
import { Repository } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { CreateChatDto, JoinChatDto, SendMessageDto } from '../dto/chat.dto';

describe('ChatService', () => {
  let service: ChatService;
  let chatRepository: Repository<Chat>;
  let messageRepository: Repository<Message>;
  let userRepository: Repository<User>;
  let redis: any;

  const mockChatRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockMessageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockRedis = {
    zadd: jest.fn(),
    zrevrange: jest.fn(),
    zremrangebyrank: jest.fn(),
    publish: jest.fn(),
    duplicate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(Chat),
          useValue: mockChatRepository,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRedisToken(),
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatRepository = module.get<Repository<Chat>>(getRepositoryToken(Chat));
    messageRepository = module.get<Repository<Message>>(getRepositoryToken(Message));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    redis = module.get(getRedisToken());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createChat', () => {
    it('should create a new chat', async () => {
      const createChatDto: CreateChatDto = {
        name: 'Test Chat',
        description: 'A test chat',
        type: 'public',
        participantIds: ['user1', 'user2'],
      };

      const mockUsers = [
        { id: 'user1', firstName: 'John', lastName: 'Doe' },
        { id: 'user2', firstName: 'Jane', lastName: 'Smith' },
      ];

      const expectedChat = {
        id: 'chat1',
        ...createChatDto,
        participants: mockUsers,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUsers[0])
        .mockResolvedValueOnce(mockUsers[1]);
      mockChatRepository.create.mockReturnValue(expectedChat);
      mockChatRepository.save.mockResolvedValue(expectedChat);

      const result = await service.createChat(createChatDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockChatRepository.create).toHaveBeenCalledWith({
        ...createChatDto,
        participants: mockUsers,
        isActive: true,
      });
      expect(mockChatRepository.save).toHaveBeenCalledWith(expectedChat);
      expect(result).toEqual(expectedChat);
    });

    it('should throw ForbiddenException if user not found', async () => {
      const createChatDto: CreateChatDto = {
        name: 'Test Chat',
        description: 'A test chat',
        type: 'public',
        participantIds: ['user1', 'user2'],
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.createChat(createChatDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getUserChats', () => {
    it('should return user chats', async () => {
      const userId = 'user1';
      const expectedChats = [
        {
          id: 'chat1',
          name: 'Test Chat 1',
          type: 'public',
          participants: [{ id: 'user1' }, { id: 'user2' }],
          messages: [],
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedChats),
      };

      mockChatRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getUserChats(userId);

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('chat.participants', 'participant');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('chat.messages', 'message');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('participant.id = :userId', { userId });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('chat.updatedAt', 'DESC');
      expect(result).toEqual(expectedChats);
    });
  });

  describe('getChatById', () => {
    it('should return chat by id', async () => {
      const chatId = 'chat1';
      const userId = 'user1';
      const expectedChat = {
        id: chatId,
        name: 'Test Chat',
        participants: [{ id: 'user1' }, { id: 'user2' }],
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(expectedChat),
      };

      mockChatRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getChatById(chatId, userId);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('chat.id = :chatId', { chatId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('participant.id = :userId', { userId });
      expect(result).toEqual(expectedChat);
    });

    it('should throw ForbiddenException if chat not found or access denied', async () => {
      const chatId = 'chat1';
      const userId = 'user1';

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockChatRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.getChatById(chatId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getChatMessages', () => {
    it('should return chat messages', async () => {
      const chatId = 'chat1';
      const userId = 'user1';
      const limit = 50;
      const offset = 0;

      const expectedMessages = [
        {
          id: 'msg1',
          content: 'Hello',
          chatId,
          senderId: 'user1',
          sequenceNumber: 1,
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedMessages),
      };

      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock getChatById to avoid throwing error
      jest.spyOn(service, 'getChatById').mockResolvedValue({} as any);

      const result = await service.getChatMessages(chatId, userId, limit, offset);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('message.chatId = :chatId', { chatId });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('message.sequenceNumber', 'ASC');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(limit);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(offset);
      expect(result).toEqual(expectedMessages);
    });
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const sendMessageDto: SendMessageDto = {
        chatId: 'chat1',
        senderId: 'user1',
        content: 'Hello',
        type: 'text',
      };

      const mockChat = {
        id: 'chat1',
        participants: [{ id: 'user1' }, { id: 'user2' }],
      };

      const expectedMessage = {
        id: 'msg1',
        ...sendMessageDto,
        sequenceNumber: 1,
        sender: { id: 'user1', firstName: 'John', lastName: 'Doe' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockChat),
      };

      mockChatRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockMessageRepository.create.mockReturnValue(expectedMessage);
      mockMessageRepository.save.mockResolvedValue(expectedMessage);

      // Mock getNextSequenceNumber
      jest.spyOn(service as any, 'getNextSequenceNumber').mockResolvedValue(1);

      // Mock storeMessageInRedis and publishMessage
      jest.spyOn(service as any, 'storeMessageInRedis').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'publishMessage').mockResolvedValue(undefined);

      const result = await service.sendMessage(sendMessageDto);

      expect(mockMessageRepository.create).toHaveBeenCalledWith({
        id: expect.any(String),
        content: sendMessageDto.content,
        type: sendMessageDto.type,
        chatId: sendMessageDto.chatId,
        senderId: sendMessageDto.senderId,
        sequenceNumber: 1,
      });
      expect(result).toEqual(expectedMessage);
    });

    it('should throw ForbiddenException if chat not found or access denied', async () => {
      const sendMessageDto: SendMessageDto = {
        chatId: 'chat1',
        senderId: 'user1',
        content: 'Hello',
        type: 'text',
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockChatRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.sendMessage(sendMessageDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('joinChat', () => {
    it('should join a chat', async () => {
      const joinChatDto: JoinChatDto = {
        chatId: 'chat1',
        userId: 'user1',
      };

      const mockChat = {
        id: 'chat1',
        participants: [{ id: 'user2' }],
      };

      const updatedChat = {
        ...mockChat,
        participants: [{ id: 'user2' }, { id: 'user1' }],
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockChat),
      };

      mockChatRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockChatRepository.save.mockResolvedValue(updatedChat);

      const result = await service.joinChat(joinChatDto);

      expect(mockChatRepository.save).toHaveBeenCalledWith({
        ...mockChat,
        participants: [...mockChat.participants, { id: 'user1' }],
      });
      expect(result).toEqual(updatedChat);
    });

    it('should throw ForbiddenException if chat not found', async () => {
      const joinChatDto: JoinChatDto = {
        chatId: 'chat1',
        userId: 'user1',
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockChatRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.joinChat(joinChatDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getRecentMessages', () => {
    it('should return recent messages from database', async () => {
      const chatId = 'chat1';
      const limit = 50;
      const expectedMessages = [
        {
          id: 'msg1',
          content: 'Hello',
          chatId,
          senderId: 'user1',
          sequenceNumber: 1,
          sender: { id: 'user1', firstName: 'John', lastName: 'Doe' },
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedMessages),
      };

      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getRecentMessages(chatId, limit);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('message.chatId = :chatId', { chatId });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('message.sequenceNumber', 'ASC');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(limit);
      expect(result).toEqual(expectedMessages);
    });
  });
});
