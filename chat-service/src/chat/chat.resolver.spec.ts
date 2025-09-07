import { Test, TestingModule } from '@nestjs/testing';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { CreateChatInput, JoinChatInput, SendMessageInput } from '../dto/chat.input';

describe('ChatResolver', () => {
  let resolver: ChatResolver;
  let service: ChatService;

  const mockChatService = {
    createChat: jest.fn(),
    getUserChats: jest.fn(),
    getChatById: jest.fn(),
    getChatMessages: jest.fn(),
    getRecentMessages: jest.fn(),
    sendMessage: jest.fn(),
    joinChat: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatResolver,
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    resolver = module.get<ChatResolver>(ChatResolver);
    service = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createChat', () => {
    it('should create a new chat', async () => {
      const createChatInput: CreateChatInput = {
        name: 'Test Chat',
        description: 'A test chat',
        type: 'public',
        participantIds: ['user1', 'user2'],
      };

      const expectedChat: Chat = {
        id: 'chat1',
        name: 'Test Chat',
        description: 'A test chat',
        type: 'public',
        participants: [
          { id: 'user1', firstName: 'John', lastName: 'Doe' },
          { id: 'user2', firstName: 'Jane', lastName: 'Smith' },
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

      mockChatService.createChat.mockResolvedValue(expectedChat);

      const result = await resolver.createChat(createChatInput);

      expect(mockChatService.createChat).toHaveBeenCalledWith(createChatInput);
      expect(result).toEqual(expectedChat);
    });
  });

  describe('userChats', () => {
    it('should return user chats', async () => {
      const userId = 'user1';
      const expectedChats: Chat[] = [
        {
          id: 'chat1',
          name: 'Test Chat 1',
          type: 'public',
          participants: [{ id: 'user1' }, { id: 'user2' }],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
        },
      ];

      mockChatService.getUserChats.mockResolvedValue(expectedChats);

      const result = await resolver.userChats(userId);

      expect(mockChatService.getUserChats).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedChats);
    });
  });

  describe('chat', () => {
    it('should return a chat by id', async () => {
      const chatId = 'chat1';
      const userId = 'user1';
      const expectedChat: Chat = {
        id: chatId,
        name: 'Test Chat',
        type: 'public',
        participants: [{ id: 'user1' }, { id: 'user2' }],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

      mockChatService.getChatById.mockResolvedValue(expectedChat);

      const result = await resolver.chat(chatId, userId);

      expect(mockChatService.getChatById).toHaveBeenCalledWith(chatId, userId);
      expect(result).toEqual(expectedChat);
    });
  });

  describe('chatMessages', () => {
    it('should return chat messages', async () => {
      const chatId = 'chat1';
      const userId = 'user1';
      const limit = 50;
      const offset = 0;

      const expectedMessages: Message[] = [
        {
          id: 'msg1',
          content: 'Hello',
          chatId,
          senderId: 'user1',
          sequenceNumber: 1,
          sender: { id: 'user1', firstName: 'John', lastName: 'Doe' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockChatService.getChatMessages.mockResolvedValue(expectedMessages);

      const result = await resolver.chatMessages(chatId, userId, limit, offset);

      expect(mockChatService.getChatMessages).toHaveBeenCalledWith(chatId, userId, limit, offset);
      expect(result).toEqual(expectedMessages);
    });
  });

  describe('recentMessages', () => {
    it('should return recent messages', async () => {
      const chatId = 'chat1';
      const limit = 50;

      const expectedMessages: Message[] = [
        {
          id: 'msg1',
          content: 'Hello',
          chatId,
          senderId: 'user1',
          sequenceNumber: 1,
          sender: { id: 'user1', firstName: 'John', lastName: 'Doe' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockChatService.getRecentMessages.mockResolvedValue(expectedMessages);

      const result = await resolver.recentMessages(chatId, limit);

      expect(mockChatService.getRecentMessages).toHaveBeenCalledWith(chatId, limit);
      expect(result).toEqual(expectedMessages);
    });
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const sendMessageInput: SendMessageInput = {
        chatId: 'chat1',
        senderId: 'user1',
        content: 'Hello',
        type: 'text',
      };

      const expectedMessage: Message = {
        id: 'msg1',
        content: 'Hello',
        type: 'text',
        chatId: 'chat1',
        senderId: 'user1',
        sequenceNumber: 1,
        sender: { id: 'user1', firstName: 'John', lastName: 'Doe' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockChatService.sendMessage.mockResolvedValue(expectedMessage);

      const result = await resolver.sendMessage(sendMessageInput);

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(sendMessageInput);
      expect(result).toEqual(expectedMessage);
    });
  });

  describe('joinChat', () => {
    it('should join a chat', async () => {
      const joinChatInput: JoinChatInput = {
        chatId: 'chat1',
        userId: 'user1',
      };

      const expectedChat: Chat = {
        id: 'chat1',
        name: 'Test Chat',
        type: 'public',
        participants: [{ id: 'user1' }, { id: 'user2' }],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

      mockChatService.joinChat.mockResolvedValue(expectedChat);

      const result = await resolver.joinChat(joinChatInput);

      expect(mockChatService.joinChat).toHaveBeenCalledWith(joinChatInput);
      expect(result).toEqual(expectedChat);
    });
  });

  describe('newMessage', () => {
    it('should return a message subscription', async () => {
      const chatId = 'chat1';
      const mockMessage: Message = {
        id: 'msg1',
        content: 'Hello',
        chatId,
        senderId: 'user1',
        sequenceNumber: 1,
        sender: { id: 'user1', firstName: 'John', lastName: 'Doe' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the subscription resolver
      const subscriptionResolver = resolver.newMessage();
      
      // This would typically be tested with a real subscription setup
      // For now, we just verify the method exists and returns a function
      expect(typeof subscriptionResolver).toBe('function');
    });
  });
});
