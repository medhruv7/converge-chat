import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// Auth link to add authentication headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('auth-token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// HTTP link for user service
const userServiceLink = authLink.concat(createHttpLink({
  uri: process.env.REACT_APP_USER_SERVICE_URL 
    ? `${process.env.REACT_APP_USER_SERVICE_URL}/graphql`
    : 'http://localhost:3006/graphql',
}));

// HTTP link for chat service - dynamic based on current instance
const createChatServiceLink = (instanceUrl?: string) => {
  const baseUrl = instanceUrl || 
                  process.env.REACT_APP_CHAT_SERVICE_URL || 
                  'http://localhost:3007';
  return authLink.concat(createHttpLink({
    uri: `${baseUrl}/graphql`,
  }));
};

const chatServiceLink = createChatServiceLink();

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(createClient({
  url: process.env.REACT_APP_CHAT_SERVICE_URL 
    ? `${process.env.REACT_APP_CHAT_SERVICE_URL.replace('http', 'ws')}/graphql`
    : 'ws://localhost:3007/graphql',
}));

// Function to determine if a query is for chat service
const isChatServiceQuery = ({ query }: { query: any }) => {
  const definition = getMainDefinition(query);
  if (definition.kind !== 'OperationDefinition') return false;
  
  const operationName = definition.name?.value;
  const chatOperations = [
    'GetUserChats',
    'GetChat',
    'GetChatMessages', 
    'GetRecentMessages',
    'CreateChat',
    'JoinChat',
    'SendMessage',
    'NewMessage'
  ];
  
  const isChatQuery = chatOperations.includes(operationName || '');
  console.log('Apollo Client Routing:', { operationName, isChatQuery });
  
  return isChatQuery;
};

// Split link to route queries to appropriate services
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  split(
    isChatServiceQuery,
    chatServiceLink,
    userServiceLink
  )
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          userChats: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          chatMessages: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
      Chat: {
        fields: {
          messages: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
