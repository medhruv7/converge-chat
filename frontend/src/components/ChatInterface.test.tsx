import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { ChatInterface } from './ChatInterface';
import { webSocketService } from '../services/websocket';
import { User, Chat, Message } from '../generated/graphql';

// Mock the WebSocket service
jest.mock('../services/websocket', () => ({
  webSocketService: {
    joinChat: jest.fn(),
    leaveChat: jest.fn(),
    sendMessage: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  },
}));

// Mock Apollo Client hooks
jest.mock('../generated/graphql', () => ({
  useGetChatQuery: jest.fn(),
}));

const mockUser: User = {
  id: 'user1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+1234567890',
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

const mockChat: Chat = {
  id: 'chat1',
  name: 'Test Chat',
  type: 'public',
  participants: [mockUser],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  messages: [],
};

const mockMessages: Message[] = [
  {
    id: 'msg1',
    content: 'Hello world',
    chatId: 'chat1',
    senderId: 'user1',
    sequenceNumber: 1,
    sender: mockUser,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'msg2',
    content: 'How are you?',
    chatId: 'chat1',
    senderId: 'user2',
    sequenceNumber: 2,
    sender: {
      id: 'user2',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+0987654321',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    createdAt: '2023-01-01T00:01:00Z',
    updatedAt: '2023-01-01T00:01:00Z',
  },
];

const mockChatWithMessages: Chat = {
  ...mockChat,
  messages: mockMessages,
};

describe('ChatInterface', () => {
  const mockUseGetChatQuery = require('../generated/graphql').useGetChatQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetChatQuery.mockReturnValue({
      data: { chat: mockChatWithMessages },
      loading: false,
      error: null,
    });
  });

  it('renders chat header with name and participant count', () => {
    render(<ChatInterface chat={mockChat} user={mockUser} />);
    
    expect(screen.getByText('Test Chat')).toBeInTheDocument();
    expect(screen.getByText('1 participants')).toBeInTheDocument();
  });

  it('renders messages correctly', () => {
    render(<ChatInterface chat={mockChatWithMessages} user={mockUser} />);
    
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('How are you?')).toBeInTheDocument();
  });

  it('shows empty state when no messages', () => {
    render(<ChatInterface chat={mockChat} user={mockUser} />);
    
    expect(screen.getByText('No messages yet. Start the conversation!')).toBeInTheDocument();
  });

  it('handles message input and sending', async () => {
    const user = userEvent.setup();
    render(<ChatInterface chat={mockChat} user={mockUser} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await user.type(input, 'Test message');
    await user.click(sendButton);
    
    expect(webSocketService.sendMessage).toHaveBeenCalledWith(
      'Test message',
      'chat1',
      'user1'
    );
    expect(input).toHaveValue('');
  });

  it('sends message on Enter key press', async () => {
    const user = userEvent.setup();
    render(<ChatInterface chat={mockChat} user={mockUser} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    expect(webSocketService.sendMessage).toHaveBeenCalledWith(
      'Test message',
      'chat1',
      'user1'
    );
  });

  it('does not send empty messages', async () => {
    const user = userEvent.setup();
    render(<ChatInterface chat={mockChat} user={mockUser} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await user.click(sendButton);
    
    expect(webSocketService.sendMessage).not.toHaveBeenCalled();
  });

  it('joins chat on mount and leaves on unmount', () => {
    const { unmount } = render(<ChatInterface chat={mockChat} user={mockUser} />);
    
    expect(webSocketService.joinChat).toHaveBeenCalledWith('chat1', 'user1');
    
    unmount();
    
    expect(webSocketService.leaveChat).toHaveBeenCalledWith('chat1', 'user1');
  });

  it('displays error messages', () => {
    render(<ChatInterface chat={mockChat} user={mockUser} />);
    
    // Simulate error by calling the error handler
    const errorHandler = webSocketService.on.mock.calls.find(
      call => call[0] === 'error'
    )?.[1];
    
    if (errorHandler) {
      errorHandler({ message: 'Connection failed' });
    }
    
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('handles messages with null sender gracefully', () => {
    const messagesWithNullSender: Message[] = [
      {
        id: 'msg1',
        content: 'Message from deleted user',
        chatId: 'chat1',
        senderId: 'deleted-user',
        sequenceNumber: 1,
        sender: null,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    ];

    const chatWithNullSender: Chat = {
      ...mockChat,
      messages: messagesWithNullSender,
    };

    render(<ChatInterface chat={chatWithNullSender} user={mockUser} />);
    
    expect(screen.getByText('Message from deleted user')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument(); // Avatar for null sender
  });

  it('groups consecutive messages from same sender', () => {
    const consecutiveMessages: Message[] = [
      {
        id: 'msg1',
        content: 'First message',
        chatId: 'chat1',
        senderId: 'user1',
        sequenceNumber: 1,
        sender: mockUser,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 'msg2',
        content: 'Second message',
        chatId: 'chat1',
        senderId: 'user1',
        sequenceNumber: 2,
        sender: mockUser,
        createdAt: '2023-01-01T00:01:00Z',
        updatedAt: '2023-01-01T00:01:00Z',
      },
    ];

    const chatWithConsecutiveMessages: Chat = {
      ...mockChat,
      messages: consecutiveMessages,
    };

    render(<ChatInterface chat={chatWithConsecutiveMessages} user={mockUser} />);
    
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
    
    // Should only show one avatar for the first message in the group
    const avatars = screen.getAllByText('JD'); // John Doe initials
    expect(avatars).toHaveLength(1);
  });
});
