import { io, Socket } from 'socket.io-client';
import { Message } from '../generated/graphql';

export interface WebSocketEvents {
  // Incoming events
  new_message: (message: Message) => void;
  user_joined: (data: { chatId: string; userId: string; message: string }) => void;
  user_left: (data: { chatId: string; userId: string; message: string }) => void;
  chat_history: (data: { chatId: string; messages: Message[] }) => void;
  error: (error: { message: string }) => void;
  
  // Outgoing events
  join_chat: (data: { chatId: string; userId: string }) => void;
  send_message: (data: { content: string; chatId: string; senderId: string; type?: string }) => void;
  leave_chat: (data: { chatId: string; userId: string }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const chatServiceUrl = process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3002';
      
      this.socket = io(`${chatServiceUrl}/chat`, {
        query: { userId },
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to chat service');
        this.isConnected = true;
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from chat service');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event listeners
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]): void {
    if (this.socket) {
      this.socket.on(event as string, callback as any);
    }
  }

  off<K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]): void {
    if (this.socket) {
      this.socket.off(event as string, callback as any);
    }
  }

  // Emit events
  emit<K extends keyof WebSocketEvents>(event: K, data: Parameters<WebSocketEvents[K]>[0]): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  // Chat operations
  joinChat(chatId: string, userId: string): void {
    this.emit('join_chat', { chatId, userId });
  }

  sendMessage(content: string, chatId: string, senderId: string, type: string = 'text'): void {
    this.emit('send_message', { content, chatId, senderId, type });
  }

  leaveChat(chatId: string, userId: string): void {
    this.emit('leave_chat', { chatId, userId });
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();
