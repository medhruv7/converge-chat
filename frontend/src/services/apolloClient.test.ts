import { apolloClient } from './apolloClient';
import { InMemoryCache } from '@apollo/client';

// Mock the dependencies
jest.mock('@apollo/client', () => ({
  ApolloClient: jest.fn(),
  InMemoryCache: jest.fn(),
  createHttpLink: jest.fn(),
  split: jest.fn(),
  setContext: jest.fn(),
}));

jest.mock('@apollo/client/link/subscriptions', () => ({
  GraphQLWsLink: jest.fn(),
}));

jest.mock('@apollo/client/utilities', () => ({
  getMainDefinition: jest.fn(),
}));

jest.mock('graphql-ws', () => ({
  createClient: jest.fn(),
}));

describe('Apollo Client Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create Apollo Client with correct configuration', () => {
    expect(apolloClient).toBeDefined();
  });

  it('should have InMemoryCache with correct type policies', () => {
    const InMemoryCacheMock = InMemoryCache as jest.MockedClass<typeof InMemoryCache>;
    
    expect(InMemoryCacheMock).toHaveBeenCalledWith({
      typePolicies: {
        Query: {
          fields: {
            userChats: {
              merge: expect.any(Function),
            },
            chatMessages: {
              merge: expect.any(Function),
            },
          },
        },
        Chat: {
          fields: {
            messages: {
              merge: expect.any(Function),
            },
          },
        },
      },
    });
  });

  it('should have correct default options', () => {
    const ApolloClientMock = require('@apollo/client').ApolloClient as jest.Mock;
    
    expect(ApolloClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultOptions: {
          watchQuery: {
            errorPolicy: 'all',
          },
          query: {
            errorPolicy: 'all',
          },
        },
      })
    );
  });

  it('should configure HTTP links for both services', () => {
    const createHttpLinkMock = require('@apollo/client').createHttpLink as jest.Mock;
    
    // Should be called twice - once for user service, once for chat service
    expect(createHttpLinkMock).toHaveBeenCalledTimes(2);
    
    // Check user service link
    expect(createHttpLinkMock).toHaveBeenCalledWith({
      uri: 'http://localhost:3000/graphql',
    });
    
    // Check chat service link
    expect(createHttpLinkMock).toHaveBeenCalledWith({
      uri: 'http://localhost:3002/graphql',
    });
  });

  it('should configure WebSocket link for subscriptions', () => {
    const createClientMock = require('graphql-ws').createClient as jest.Mock;
    
    expect(createClientMock).toHaveBeenCalledWith({
      url: 'ws://localhost:3002/graphql',
    });
  });

  it('should configure auth link to add authorization header', () => {
    const setContextMock = require('@apollo/client').setContext as jest.Mock;
    
    expect(setContextMock).toHaveBeenCalled();
    
    // Get the auth link function
    const authLinkFunction = setContextMock.mock.calls[0][0];
    
    // Mock localStorage
    const mockToken = 'test-token';
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => mockToken),
      },
      writable: true,
    });
    
    // Test the auth link function
    const result = authLinkFunction({}, { headers: {} });
    
    expect(result).toEqual({
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
    });
  });

  it('should handle missing auth token', () => {
    const setContextMock = require('@apollo/client').setContext as jest.Mock;
    
    // Get the auth link function
    const authLinkFunction = setContextMock.mock.calls[0][0];
    
    // Mock localStorage with no token
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
      },
      writable: true,
    });
    
    // Test the auth link function
    const result = authLinkFunction({}, { headers: {} });
    
    expect(result).toEqual({
      headers: {
        authorization: '',
      },
    });
  });

  it('should configure split link for routing', () => {
    const splitMock = require('@apollo/client').split as jest.Mock;
    
    // Should be called twice - once for subscription split, once for service split
    expect(splitMock).toHaveBeenCalledTimes(2);
  });

  it('should have correct cache merge functions', () => {
    const InMemoryCacheMock = InMemoryCache as jest.MockedClass<typeof InMemoryCache>;
    const cacheConfig = InMemoryCacheMock.mock.calls[0][0];
    
    // Test userChats merge function
    const userChatsMerge = cacheConfig.typePolicies.Query.fields.userChats.merge;
    expect(userChatsMerge([], ['new', 'chats'])).toEqual(['new', 'chats']);
    
    // Test chatMessages merge function
    const chatMessagesMerge = cacheConfig.typePolicies.Query.fields.chatMessages.merge;
    expect(chatMessagesMerge(['existing'], ['new', 'messages'])).toEqual(['existing', 'new', 'messages']);
    
    // Test Chat messages merge function
    const chatMessagesMerge2 = cacheConfig.typePolicies.Chat.fields.messages.merge;
    expect(chatMessagesMerge2(['existing'], ['new', 'messages'])).toEqual(['new', 'messages']);
  });
});
