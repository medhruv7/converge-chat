export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  participants: User[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  chatId: string;
  sequenceNumber: number;
  sender?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface CreateChatInput {
  name: string;
  description?: string;
  type: 'public' | 'private' | 'group';
  participantIds: string[];
}

export interface SendMessageInput {
  content: string;
  chatId: string;
  senderId: string;
  type?: 'text' | 'image' | 'file';
}

export interface JoinChatInput {
  chatId: string;
  userId: string;
}
