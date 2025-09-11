import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type Chat = {
  __typename?: 'Chat';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  messages: Array<Message>;
  name: Scalars['String']['output'];
  participantIds: Array<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateChatInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  participantIds: Array<Scalars['String']['input']>;
  type?: Scalars['String']['input'];
};

export type CreateUserInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};

export type JoinChatInput = {
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type Message = {
  __typename?: 'Message';
  chatId: Scalars['String']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  senderId: Scalars['String']['output'];
  sequenceNumber: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createChat: Chat;
  createUser: User;
  deleteUser: Scalars['Boolean']['output'];
  joinChat: Chat;
  sendMessage: Message;
  updateUser?: Maybe<User>;
};


export type MutationCreateChatArgs = {
  input: CreateChatInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationJoinChatArgs = {
  input: JoinChatInput;
};


export type MutationSendMessageArgs = {
  input: SendMessageInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};

export type Query = {
  __typename?: 'Query';
  activeUsers: Array<User>;
  chat?: Maybe<Chat>;
  chatMessages: Array<Message>;
  recentMessages: Array<Message>;
  user?: Maybe<User>;
  userChats: Array<Chat>;
  users: Array<User>;
};


export type QueryChatArgs = {
  chatId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryChatMessagesArgs = {
  chatId: Scalars['ID']['input'];
  limit?: Scalars['Float']['input'];
  offset?: Scalars['Float']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryRecentMessagesArgs = {
  chatId: Scalars['ID']['input'];
  limit?: Scalars['Float']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserChatsArgs = {
  userId: Scalars['ID']['input'];
};

export type SendMessageInput = {
  chatId: Scalars['String']['input'];
  content: Scalars['String']['input'];
  senderId: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  newMessage: Message;
};


export type SubscriptionNewMessageArgs = {
  chatId: Scalars['ID']['input'];
};

export type UpdateUserInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  phoneNumber: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, email: string, firstName: string, lastName: string, phoneNumber: string, isActive: boolean, createdAt: any, updatedAt: any } };

export type CreateChatMutationVariables = Exact<{
  input: CreateChatInput;
}>;


export type CreateChatMutation = { __typename?: 'Mutation', createChat: { __typename?: 'Chat', id: string, name: string, description?: string | null, participantIds: Array<string>, createdAt: any, updatedAt: any } };

export type JoinChatMutationVariables = Exact<{
  input: JoinChatInput;
}>;


export type JoinChatMutation = { __typename?: 'Mutation', joinChat: { __typename?: 'Chat', id: string, name: string, description?: string | null, participantIds: Array<string>, createdAt: any, updatedAt: any } };

export type SendMessageMutationVariables = Exact<{
  input: SendMessageInput;
}>;


export type SendMessageMutation = { __typename?: 'Mutation', sendMessage: { __typename?: 'Message', id: string, content: string, senderId: string, chatId: string, sequenceNumber: number, createdAt: any, updatedAt: any } };

export type GetUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, email: string, firstName: string, lastName: string, phoneNumber: string, isActive: boolean, createdAt: any, updatedAt: any }> };

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, email: string, firstName: string, lastName: string, phoneNumber: string, isActive: boolean, createdAt: any, updatedAt: any } | null };

export type GetActiveUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveUsersQuery = { __typename?: 'Query', activeUsers: Array<{ __typename?: 'User', id: string, email: string, firstName: string, lastName: string, phoneNumber: string, isActive: boolean, createdAt: any, updatedAt: any }> };

export type GetUserChatsQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetUserChatsQuery = { __typename?: 'Query', userChats: Array<{ __typename?: 'Chat', id: string, name: string, description?: string | null, type: string, participantIds: Array<string>, createdAt: any, updatedAt: any, messages: Array<{ __typename?: 'Message', id: string, content: string, senderId: string, chatId: string, sequenceNumber: number, createdAt: any, updatedAt: any }> }> };

export type GetChatQueryVariables = Exact<{
  chatId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type GetChatQuery = { __typename?: 'Query', chat?: { __typename?: 'Chat', id: string, name: string, description?: string | null, participantIds: Array<string>, createdAt: any, updatedAt: any, messages: Array<{ __typename?: 'Message', id: string, content: string, senderId: string, chatId: string, sequenceNumber: number, createdAt: any, updatedAt: any }> } | null };

export type GetChatMessagesQueryVariables = Exact<{
  chatId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
}>;


export type GetChatMessagesQuery = { __typename?: 'Query', chatMessages: Array<{ __typename?: 'Message', id: string, content: string, senderId: string, chatId: string, sequenceNumber: number, createdAt: any, updatedAt: any }> };

export type GetRecentMessagesQueryVariables = Exact<{
  chatId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Float']['input']>;
}>;


export type GetRecentMessagesQuery = { __typename?: 'Query', recentMessages: Array<{ __typename?: 'Message', id: string, content: string, senderId: string, chatId: string, sequenceNumber: number, createdAt: any, updatedAt: any }> };

export type NewMessageSubscriptionVariables = Exact<{
  chatId: Scalars['ID']['input'];
}>;


export type NewMessageSubscription = { __typename?: 'Subscription', newMessage: { __typename?: 'Message', id: string, content: string, senderId: string, chatId: string, sequenceNumber: number, createdAt: any, updatedAt: any } };


export const CreateUserDocument = gql`
    mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    email
    firstName
    lastName
    phoneNumber
    isActive
    createdAt
    updatedAt
  }
}
    `;
export type CreateUserMutationFn = Apollo.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateUserMutation(baseOptions?: Apollo.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, options);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const CreateChatDocument = gql`
    mutation CreateChat($input: CreateChatInput!) {
  createChat(input: $input) {
    id
    name
    description
    participantIds
    createdAt
    updatedAt
  }
}
    `;
export type CreateChatMutationFn = Apollo.MutationFunction<CreateChatMutation, CreateChatMutationVariables>;

/**
 * __useCreateChatMutation__
 *
 * To run a mutation, you first call `useCreateChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createChatMutation, { data, loading, error }] = useCreateChatMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateChatMutation(baseOptions?: Apollo.MutationHookOptions<CreateChatMutation, CreateChatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateChatMutation, CreateChatMutationVariables>(CreateChatDocument, options);
      }
export type CreateChatMutationHookResult = ReturnType<typeof useCreateChatMutation>;
export type CreateChatMutationResult = Apollo.MutationResult<CreateChatMutation>;
export type CreateChatMutationOptions = Apollo.BaseMutationOptions<CreateChatMutation, CreateChatMutationVariables>;
export const JoinChatDocument = gql`
    mutation JoinChat($input: JoinChatInput!) {
  joinChat(input: $input) {
    id
    name
    description
    participantIds
    createdAt
    updatedAt
  }
}
    `;
export type JoinChatMutationFn = Apollo.MutationFunction<JoinChatMutation, JoinChatMutationVariables>;

/**
 * __useJoinChatMutation__
 *
 * To run a mutation, you first call `useJoinChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinChatMutation, { data, loading, error }] = useJoinChatMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useJoinChatMutation(baseOptions?: Apollo.MutationHookOptions<JoinChatMutation, JoinChatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<JoinChatMutation, JoinChatMutationVariables>(JoinChatDocument, options);
      }
export type JoinChatMutationHookResult = ReturnType<typeof useJoinChatMutation>;
export type JoinChatMutationResult = Apollo.MutationResult<JoinChatMutation>;
export type JoinChatMutationOptions = Apollo.BaseMutationOptions<JoinChatMutation, JoinChatMutationVariables>;
export const SendMessageDocument = gql`
    mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    id
    content
    senderId
    chatId
    sequenceNumber
    createdAt
    updatedAt
  }
}
    `;
export type SendMessageMutationFn = Apollo.MutationFunction<SendMessageMutation, SendMessageMutationVariables>;

/**
 * __useSendMessageMutation__
 *
 * To run a mutation, you first call `useSendMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendMessageMutation, { data, loading, error }] = useSendMessageMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSendMessageMutation(baseOptions?: Apollo.MutationHookOptions<SendMessageMutation, SendMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendMessageMutation, SendMessageMutationVariables>(SendMessageDocument, options);
      }
export type SendMessageMutationHookResult = ReturnType<typeof useSendMessageMutation>;
export type SendMessageMutationResult = Apollo.MutationResult<SendMessageMutation>;
export type SendMessageMutationOptions = Apollo.BaseMutationOptions<SendMessageMutation, SendMessageMutationVariables>;
export const GetUsersDocument = gql`
    query GetUsers {
  users {
    id
    email
    firstName
    lastName
    phoneNumber
    isActive
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
      }
export function useGetUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export function useGetUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export type GetUsersSuspenseQueryHookResult = ReturnType<typeof useGetUsersSuspenseQuery>;
export type GetUsersQueryResult = Apollo.QueryResult<GetUsersQuery, GetUsersQueryVariables>;
export function refetchGetUsersQuery(variables?: GetUsersQueryVariables) {
      return { query: GetUsersDocument, variables: variables }
    }
export const GetUserDocument = gql`
    query GetUser($id: ID!) {
  user(id: $id) {
    id
    email
    firstName
    lastName
    phoneNumber
    isActive
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserQuery(baseOptions: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables> & ({ variables: GetUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
      }
export function useGetUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
        }
export function useGetUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
        }
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserSuspenseQueryHookResult = ReturnType<typeof useGetUserSuspenseQuery>;
export type GetUserQueryResult = Apollo.QueryResult<GetUserQuery, GetUserQueryVariables>;
export function refetchGetUserQuery(variables: GetUserQueryVariables) {
      return { query: GetUserDocument, variables: variables }
    }
export const GetActiveUsersDocument = gql`
    query GetActiveUsers {
  activeUsers {
    id
    email
    firstName
    lastName
    phoneNumber
    isActive
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetActiveUsersQuery__
 *
 * To run a query within a React component, call `useGetActiveUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetActiveUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetActiveUsersQuery, GetActiveUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActiveUsersQuery, GetActiveUsersQueryVariables>(GetActiveUsersDocument, options);
      }
export function useGetActiveUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActiveUsersQuery, GetActiveUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActiveUsersQuery, GetActiveUsersQueryVariables>(GetActiveUsersDocument, options);
        }
export function useGetActiveUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActiveUsersQuery, GetActiveUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActiveUsersQuery, GetActiveUsersQueryVariables>(GetActiveUsersDocument, options);
        }
export type GetActiveUsersQueryHookResult = ReturnType<typeof useGetActiveUsersQuery>;
export type GetActiveUsersLazyQueryHookResult = ReturnType<typeof useGetActiveUsersLazyQuery>;
export type GetActiveUsersSuspenseQueryHookResult = ReturnType<typeof useGetActiveUsersSuspenseQuery>;
export type GetActiveUsersQueryResult = Apollo.QueryResult<GetActiveUsersQuery, GetActiveUsersQueryVariables>;
export function refetchGetActiveUsersQuery(variables?: GetActiveUsersQueryVariables) {
      return { query: GetActiveUsersDocument, variables: variables }
    }
export const GetUserChatsDocument = gql`
    query GetUserChats($userId: ID!) {
  userChats(userId: $userId) {
    id
    name
    description
    type
    participantIds
    messages {
      id
      content
      senderId
      chatId
      sequenceNumber
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetUserChatsQuery__
 *
 * To run a query within a React component, call `useGetUserChatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserChatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserChatsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserChatsQuery(baseOptions: Apollo.QueryHookOptions<GetUserChatsQuery, GetUserChatsQueryVariables> & ({ variables: GetUserChatsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserChatsQuery, GetUserChatsQueryVariables>(GetUserChatsDocument, options);
      }
export function useGetUserChatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserChatsQuery, GetUserChatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserChatsQuery, GetUserChatsQueryVariables>(GetUserChatsDocument, options);
        }
export function useGetUserChatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserChatsQuery, GetUserChatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserChatsQuery, GetUserChatsQueryVariables>(GetUserChatsDocument, options);
        }
export type GetUserChatsQueryHookResult = ReturnType<typeof useGetUserChatsQuery>;
export type GetUserChatsLazyQueryHookResult = ReturnType<typeof useGetUserChatsLazyQuery>;
export type GetUserChatsSuspenseQueryHookResult = ReturnType<typeof useGetUserChatsSuspenseQuery>;
export type GetUserChatsQueryResult = Apollo.QueryResult<GetUserChatsQuery, GetUserChatsQueryVariables>;
export function refetchGetUserChatsQuery(variables: GetUserChatsQueryVariables) {
      return { query: GetUserChatsDocument, variables: variables }
    }
export const GetChatDocument = gql`
    query GetChat($chatId: ID!, $userId: ID!) {
  chat(chatId: $chatId, userId: $userId) {
    id
    name
    description
    participantIds
    messages {
      id
      content
      senderId
      chatId
      sequenceNumber
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetChatQuery__
 *
 * To run a query within a React component, call `useGetChatQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChatQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChatQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetChatQuery(baseOptions: Apollo.QueryHookOptions<GetChatQuery, GetChatQueryVariables> & ({ variables: GetChatQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetChatQuery, GetChatQueryVariables>(GetChatDocument, options);
      }
export function useGetChatLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetChatQuery, GetChatQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetChatQuery, GetChatQueryVariables>(GetChatDocument, options);
        }
export function useGetChatSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetChatQuery, GetChatQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetChatQuery, GetChatQueryVariables>(GetChatDocument, options);
        }
export type GetChatQueryHookResult = ReturnType<typeof useGetChatQuery>;
export type GetChatLazyQueryHookResult = ReturnType<typeof useGetChatLazyQuery>;
export type GetChatSuspenseQueryHookResult = ReturnType<typeof useGetChatSuspenseQuery>;
export type GetChatQueryResult = Apollo.QueryResult<GetChatQuery, GetChatQueryVariables>;
export function refetchGetChatQuery(variables: GetChatQueryVariables) {
      return { query: GetChatDocument, variables: variables }
    }
export const GetChatMessagesDocument = gql`
    query GetChatMessages($chatId: ID!, $userId: ID!, $limit: Float, $offset: Float) {
  chatMessages(chatId: $chatId, userId: $userId, limit: $limit, offset: $offset) {
    id
    content
    senderId
    chatId
    sequenceNumber
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetChatMessagesQuery__
 *
 * To run a query within a React component, call `useGetChatMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChatMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChatMessagesQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      userId: // value for 'userId'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetChatMessagesQuery(baseOptions: Apollo.QueryHookOptions<GetChatMessagesQuery, GetChatMessagesQueryVariables> & ({ variables: GetChatMessagesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetChatMessagesQuery, GetChatMessagesQueryVariables>(GetChatMessagesDocument, options);
      }
export function useGetChatMessagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetChatMessagesQuery, GetChatMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetChatMessagesQuery, GetChatMessagesQueryVariables>(GetChatMessagesDocument, options);
        }
export function useGetChatMessagesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetChatMessagesQuery, GetChatMessagesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetChatMessagesQuery, GetChatMessagesQueryVariables>(GetChatMessagesDocument, options);
        }
export type GetChatMessagesQueryHookResult = ReturnType<typeof useGetChatMessagesQuery>;
export type GetChatMessagesLazyQueryHookResult = ReturnType<typeof useGetChatMessagesLazyQuery>;
export type GetChatMessagesSuspenseQueryHookResult = ReturnType<typeof useGetChatMessagesSuspenseQuery>;
export type GetChatMessagesQueryResult = Apollo.QueryResult<GetChatMessagesQuery, GetChatMessagesQueryVariables>;
export function refetchGetChatMessagesQuery(variables: GetChatMessagesQueryVariables) {
      return { query: GetChatMessagesDocument, variables: variables }
    }
export const GetRecentMessagesDocument = gql`
    query GetRecentMessages($chatId: ID!, $userId: ID!, $limit: Float) {
  recentMessages(chatId: $chatId, userId: $userId, limit: $limit) {
    id
    content
    senderId
    chatId
    sequenceNumber
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetRecentMessagesQuery__
 *
 * To run a query within a React component, call `useGetRecentMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecentMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecentMessagesQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      userId: // value for 'userId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetRecentMessagesQuery(baseOptions: Apollo.QueryHookOptions<GetRecentMessagesQuery, GetRecentMessagesQueryVariables> & ({ variables: GetRecentMessagesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecentMessagesQuery, GetRecentMessagesQueryVariables>(GetRecentMessagesDocument, options);
      }
export function useGetRecentMessagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecentMessagesQuery, GetRecentMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecentMessagesQuery, GetRecentMessagesQueryVariables>(GetRecentMessagesDocument, options);
        }
export function useGetRecentMessagesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecentMessagesQuery, GetRecentMessagesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecentMessagesQuery, GetRecentMessagesQueryVariables>(GetRecentMessagesDocument, options);
        }
export type GetRecentMessagesQueryHookResult = ReturnType<typeof useGetRecentMessagesQuery>;
export type GetRecentMessagesLazyQueryHookResult = ReturnType<typeof useGetRecentMessagesLazyQuery>;
export type GetRecentMessagesSuspenseQueryHookResult = ReturnType<typeof useGetRecentMessagesSuspenseQuery>;
export type GetRecentMessagesQueryResult = Apollo.QueryResult<GetRecentMessagesQuery, GetRecentMessagesQueryVariables>;
export function refetchGetRecentMessagesQuery(variables: GetRecentMessagesQueryVariables) {
      return { query: GetRecentMessagesDocument, variables: variables }
    }
export const NewMessageDocument = gql`
    subscription NewMessage($chatId: ID!) {
  newMessage(chatId: $chatId) {
    id
    content
    senderId
    chatId
    sequenceNumber
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useNewMessageSubscription__
 *
 * To run a query within a React component, call `useNewMessageSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNewMessageSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNewMessageSubscription({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useNewMessageSubscription(baseOptions: Apollo.SubscriptionHookOptions<NewMessageSubscription, NewMessageSubscriptionVariables> & ({ variables: NewMessageSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<NewMessageSubscription, NewMessageSubscriptionVariables>(NewMessageDocument, options);
      }
export type NewMessageSubscriptionHookResult = ReturnType<typeof useNewMessageSubscription>;
export type NewMessageSubscriptionResult = Apollo.SubscriptionResult<NewMessageSubscription>;