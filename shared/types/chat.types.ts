export interface Chat {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdBy: string;
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  timestamp: Date;
  messageType: 'text' | 'image' | 'file';
}

export interface CreateChatRequest {
  name: string;
  description?: string;
  isPrivate: boolean;
  participantIds: string[];
}

export interface SendMessageRequest {
  content: string;
  chatId: string;
  senderId: string;
  messageType?: 'text' | 'image' | 'file';
}

export interface JoinChatRequest {
  chatId: string;
  userId: string;
}

export interface ChatResponse {
  success: boolean;
  data?: Chat | Chat[];
  error?: string;
}

export interface MessageResponse {
  success: boolean;
  data?: Message | Message[];
  error?: string;
}