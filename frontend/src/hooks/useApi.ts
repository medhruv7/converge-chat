// Custom hooks that use real API calls instead of mock GraphQL
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { User, Chat, Message, CreateUserInput, CreateChatInput, SendMessageInput, JoinChatInput } from '../types';

// Hook for fetching users
export const useGetUsersQuery = (options?: { skip?: boolean }) => {
  const [data, setData] = useState<{ users: User[] } | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const refetch = async () => {
    if (options?.skip) return { data: undefined };
    
    setLoading(true);
    setError(null);
    try {
      const users = await apiService.getUsers();
      const result = { users };
      setData(result);
      return { data: result };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!options?.skip) {
      refetch();
    }
  }, [options?.skip]);

  return { data, loading, error, refetch };
};

// Hook for fetching a single user
export const useGetUserQuery = (options?: { variables?: { id: string }; skip?: boolean }) => {
  const [data, setData] = useState<{ user: User } | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const refetch = async () => {
    if (options?.skip || !options?.variables?.id) return { data: undefined };
    
    setLoading(true);
    setError(null);
    try {
      const user = await apiService.getUser(options.variables.id);
      const result = { user };
      setData(result);
      return { data: result };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!options?.skip && options?.variables?.id) {
      refetch();
    }
  }, [options?.skip, options?.variables?.id]);

  return { data, loading, error, refetch };
};

// Hook for fetching active users
export const useGetActiveUsersQuery = (options?: { skip?: boolean }) => {
  const [data, setData] = useState<{ activeUsers: User[] } | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const refetch = async () => {
    if (options?.skip) return { data: undefined };
    
    setLoading(true);
    setError(null);
    try {
      const activeUsers = await apiService.getActiveUsers();
      const result = { activeUsers };
      setData(result);
      return { data: result };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!options?.skip) {
      refetch();
    }
  }, [options?.skip]);

  return { data, loading, error, refetch };
};

// Hook for fetching user chats
export const useGetUserChatsQuery = (options?: { variables?: { userId: string }; skip?: boolean }) => {
  const [data, setData] = useState<{ userChats: Chat[] } | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const refetch = async () => {
    if (options?.skip || !options?.variables?.userId) return { data: undefined };
    
    setLoading(true);
    setError(null);
    try {
      const userChats = await apiService.getUserChats(options.variables.userId);
      const result = { userChats };
      setData(result);
      return { data: result };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!options?.skip && options?.variables?.userId) {
      refetch();
    }
  }, [options?.skip, options?.variables?.userId]);

  return { data, loading, error, refetch };
};

// Hook for fetching a single chat
export const useGetChatQuery = (options?: { variables?: { chatId: string; userId: string }; skip?: boolean }) => {
  const [data, setData] = useState<{ chat: Chat } | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const refetch = async () => {
    if (options?.skip || !options?.variables?.chatId || !options?.variables?.userId) {
      return { data: undefined };
    }
    
    setLoading(true);
    setError(null);
    try {
      const chat = await apiService.getChat(options.variables.chatId, options.variables.userId);
      const result = { chat };
      setData(result);
      return { data: result };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!options?.skip && options?.variables?.chatId && options?.variables?.userId) {
      refetch();
    }
  }, [options?.skip, options?.variables?.chatId, options?.variables?.userId]);

  return { data, loading, error, refetch };
};

// Hook for fetching chat messages
export const useGetChatMessagesQuery = (options?: { 
  variables?: { chatId: string; userId: string; limit?: number; offset?: number }; 
  skip?: boolean 
}) => {
  const [data, setData] = useState<{ chatMessages: Message[] } | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const refetch = async () => {
    if (options?.skip || !options?.variables?.chatId || !options?.variables?.userId) {
      return { data: undefined };
    }
    
    setLoading(true);
    setError(null);
    try {
      const chatMessages = await apiService.getChatMessages(
        options.variables.chatId, 
        options.variables.userId,
        options.variables.limit || 50,
        options.variables.offset || 0
      );
      const result = { chatMessages };
      setData(result);
      return { data: result };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!options?.skip && options?.variables?.chatId && options?.variables?.userId) {
      refetch();
    }
  }, [options?.skip, options?.variables?.chatId, options?.variables?.userId]);

  return { data, loading, error, refetch };
};

// Hook for fetching recent messages
export const useGetRecentMessagesQuery = (options?: { 
  variables?: { chatId: string; limit?: number }; 
  skip?: boolean 
}) => {
  const [data, setData] = useState<{ recentMessages: Message[] } | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const refetch = async () => {
    if (options?.skip || !options?.variables?.chatId) return { data: undefined };
    
    setLoading(true);
    setError(null);
    try {
      const recentMessages = await apiService.getRecentMessages(
        options.variables.chatId,
        options.variables.limit || 50
      );
      const result = { recentMessages };
      setData(result);
      return { data: result };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!options?.skip && options?.variables?.chatId) {
      refetch();
    }
  }, [options?.skip, options?.variables?.chatId]);

  return { data, loading, error, refetch };
};

// Mutation hooks - these return tuples like Apollo Client
export const useCreateUserMutation = (): [
  (options: { variables: { input: CreateUserInput } }) => Promise<{ data: { createUser: User } }>,
  { loading: boolean; error: any }
] => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const createUser = async (options: { variables: { input: CreateUserInput } }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.createUser(options.variables.input);
      setLoading(false);
      return { data: { createUser: result } };
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return [createUser, { loading, error }];
};

export const useCreateChatMutation = (): [
  (options: { variables: { input: CreateChatInput } }) => Promise<{ data: { createChat: Chat } }>,
  { loading: boolean; error: any }
] => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const createChat = async (options: { variables: { input: CreateChatInput } }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.createChat(options.variables.input);
      setLoading(false);
      return { data: { createChat: result } };
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return [createChat, { loading, error }];
};

export const useJoinChatMutation = (): [
  (options: { variables: { input: JoinChatInput } }) => Promise<{ data: { joinChat: Chat } }>,
  { loading: boolean; error: any }
] => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const joinChat = async (options: { variables: { input: JoinChatInput } }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.joinChat(options.variables.input);
      setLoading(false);
      return { data: { joinChat: result } };
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return [joinChat, { loading, error }];
};

export const useSendMessageMutation = (): [
  (options: { variables: { input: SendMessageInput } }) => Promise<{ data: { sendMessage: Message } }>,
  { loading: boolean; error: any }
] => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const sendMessage = async (options: { variables: { input: SendMessageInput } }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.sendMessage(options.variables.input);
      setLoading(false);
      return { data: { sendMessage: result } };
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return [sendMessage, { loading, error }];
};