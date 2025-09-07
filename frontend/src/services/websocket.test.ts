import { webSocketService } from './websocket';
import { io } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

const mockSocket = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  connected: true, // Mock as connected
};

describe('WebSocketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (io as jest.Mock).mockReturnValue(mockSocket);
    
    // Mock the service to have a connected socket
    (webSocketService as any).socket = mockSocket;
    (webSocketService as any).isConnected = true;
  });

  describe('basic functionality', () => {
    it('should create socket instance', () => {
      webSocketService.connect('user1');
      
      expect(io).toHaveBeenCalledWith('http://localhost:3002/chat', {
        query: { userId: 'user1' },
        transports: ['websocket', 'polling'],
      });
    });

    it('should emit join_chat event', () => {
      webSocketService.joinChat('chat1', 'user1');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('join_chat', {
        chatId: 'chat1',
        userId: 'user1',
      });
    });

    it('should emit leave_chat event', () => {
      webSocketService.leaveChat('chat1', 'user1');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('leave_chat', {
        chatId: 'chat1',
        userId: 'user1',
      });
    });

    it('should emit send_message event', () => {
      webSocketService.sendMessage('Hello', 'chat1', 'user1');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('send_message', {
        content: 'Hello',
        chatId: 'chat1',
        senderId: 'user1',
        type: 'text',
      });
    });

    it('should register event listeners', () => {
      const mockCallback = jest.fn();
      
      webSocketService.on('new_message', mockCallback);
      webSocketService.on('error', mockCallback);
      
      expect(mockSocket.on).toHaveBeenCalledWith('new_message', mockCallback);
      expect(mockSocket.on).toHaveBeenCalledWith('error', mockCallback);
    });

    it('should unregister event listeners', () => {
      const mockCallback = jest.fn();
      
      webSocketService.off('new_message', mockCallback);
      webSocketService.off('error', mockCallback);
      
      expect(mockSocket.off).toHaveBeenCalledWith('new_message', mockCallback);
      expect(mockSocket.off).toHaveBeenCalledWith('error', mockCallback);
    });
  });
});