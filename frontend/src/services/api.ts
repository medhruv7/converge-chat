// REST API service for communicating with backend services
// This replaces the mock GraphQL hooks with real API calls

import { User, Chat, Message, CreateUserInput, CreateChatInput, SendMessageInput, JoinChatInput } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3006';
const CHAT_API_BASE_URL = process.env.REACT_APP_CHAT_API_BASE_URL || 'http://localhost:3007';

class ApiService {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // User Service API calls
  async getUsers(): Promise<User[]> {
    return this.request<User[]>(`${API_BASE_URL}/users`);
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`${API_BASE_URL}/users/${id}`);
  }

  async getActiveUsers(): Promise<User[]> {
    return this.request<User[]>(`${API_BASE_URL}/users/active`);
  }

  async createUser(input: CreateUserInput): Promise<User> {
    return this.request<User>(`${API_BASE_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // Chat Service API calls
  async getUserChats(userId: string): Promise<Chat[]> {
    return this.request<Chat[]>(`${CHAT_API_BASE_URL}/chats/user/${userId}`);
  }

  async getChat(chatId: string, userId: string): Promise<Chat> {
    return this.request<Chat>(`${CHAT_API_BASE_URL}/chats/${chatId}/user/${userId}`);
  }

  async getChatMessages(chatId: string, userId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const params = new URLSearchParams({
      userId,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.request<Message[]>(`${CHAT_API_BASE_URL}/chats/${chatId}/messages?${params}`);
  }

  async getRecentMessages(chatId: string, limit: number = 50): Promise<Message[]> {
    return this.request<Message[]>(`${CHAT_API_BASE_URL}/chats/${chatId}/messages/recent?limit=${limit}`);
  }

  async createChat(input: CreateChatInput): Promise<Chat> {
    return this.request<Chat>(`${CHAT_API_BASE_URL}/chats`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async joinChat(input: JoinChatInput): Promise<Chat> {
    return this.request<Chat>(`${CHAT_API_BASE_URL}/chats/join`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    return this.request<Message>(`${CHAT_API_BASE_URL}/chats/messages`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }
}

export const apiService = new ApiService();
