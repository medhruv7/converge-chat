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
  join: jest.fn(),
  leave: jest.fn(),
};

describe('WebSocketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  describe('connect', () => {
    it('should connect to WebSocket server', () => {
      webSocketService.connect();
      
      expect(io).toHaveBeenCalledWith('http://localhost:3002', {
        autoConnect: true,
      });
    });

    it('should set up event listeners on connection', () => {
      webSocketService.connect();
      
      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });

  describe('disconnect', () => {
    it('should disconnect from WebSocket server', () => {
      webSocketService.connect();
      webSocketService.disconnect();
      
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('joinChat', () => {
    it('should emit join_chat event', () => {
      webSocketService.connect();
      webSocketService.joinChat('chat1', 'user1');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('join_chat', {
        chatId: 'chat1',
        userId: 'user1',
      });
    });
  });

  describe('leaveChat', () => {
    it('should emit leave_chat event', () => {
      webSocketService.connect();
      webSocketService.leaveChat('chat1', 'user1');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('leave_chat', {
        chatId: 'chat1',
        userId: 'user1',
      });
    });
  });

  describe('sendMessage', () => {
    it('should emit send_message event', () => {
      webSocketService.connect();
      webSocketService.sendMessage('Hello', 'chat1', 'user1');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('send_message', {
        content: 'Hello',
        chatId: 'chat1',
        senderId: 'user1',
        type: 'text',
      });
    });

    it('should send message with custom type', () => {
      webSocketService.connect();
      webSocketService.sendMessage('Hello', 'chat1', 'user1', 'image');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('send_message', {
        content: 'Hello',
        chatId: 'chat1',
        senderId: 'user1',
        type: 'image',
      });
    });
  });

  describe('event listeners', () => {
    it('should register event listeners', () => {
      const mockCallback = jest.fn();
      webSocketService.connect();
      
      webSocketService.on('new_message', mockCallback);
      webSocketService.on('user_joined', mockCallback);
      webSocketService.on('user_left', mockCallback);
      webSocketService.on('chat_history', mockCallback);
      webSocketService.on('error', mockCallback);
      
      expect(mockSocket.on).toHaveBeenCalledWith('new_message', mockCallback);
      expect(mockSocket.on).toHaveBeenCalledWith('user_joined', mockCallback);
      expect(mockSocket.on).toHaveBeenCalledWith('user_left', mockCallback);
      expect(mockSocket.on).toHaveBeenCalledWith('chat_history', mockCallback);
      expect(mockSocket.on).toHaveBeenCalledWith('error', mockCallback);
    });

    it('should unregister event listeners', () => {
      const mockCallback = jest.fn();
      webSocketService.connect();
      
      webSocketService.off('new_message', mockCallback);
      webSocketService.off('user_joined', mockCallback);
      webSocketService.off('user_left', mockCallback);
      webSocketService.off('chat_history', mockCallback);
      webSocketService.off('error', mockCallback);
      
      expect(mockSocket.off).toHaveBeenCalledWith('new_message', mockCallback);
      expect(mockSocket.off).toHaveBeenCalledWith('user_joined', mockCallback);
      expect(mockSocket.off).toHaveBeenCalledWith('user_left', mockCallback);
      expect(mockSocket.off).toHaveBeenCalledWith('chat_history', mockCallback);
      expect(mockSocket.off).toHaveBeenCalledWith('error', mockCallback);
    });
  });

  describe('connection status', () => {
    it('should track connection status', () => {
      expect(webSocketService.isConnected).toBe(false);
      
      webSocketService.connect();
      
      // Simulate connection
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )?.[1];
      
      if (connectHandler) {
        connectHandler();
      }
      
      expect(webSocketService.isConnected).toBe(true);
    });

    it('should update connection status on disconnect', () => {
      webSocketService.connect();
      
      // Simulate disconnection
      const disconnectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'disconnect'
      )?.[1];
      
      if (disconnectHandler) {
        disconnectHandler();
      }
      
      expect(webSocketService.isConnected).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle connection errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      webSocketService.connect();
      
      // Simulate error
      const errorHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];
      
      if (errorHandler) {
        errorHandler({ message: 'Connection failed' });
      }
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('WebSocket error:', { message: 'Connection failed' });
      
      consoleErrorSpy.mockRestore();
    });
  });
});
