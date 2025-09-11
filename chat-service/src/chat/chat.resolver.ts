import { Resolver, Query, Mutation, Args, ID, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { ChatService } from './chat.service';
import { Chat } from '../entities/chat.entity.graphql';
import { Message } from '../entities/message.entity.graphql';
import { CreateChatInput, JoinChatInput, SendMessageInput } from '../dto/chat.input';

const pubSub = new PubSub();

@Resolver(() => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Query(() => [Chat], { name: 'userChats' })
  async getUserChats(@Args('userId', { type: () => ID }) userId: string): Promise<Chat[]> {
    return this.chatService.getChats(userId);
  }

  @Query(() => Chat, { name: 'chat', nullable: true })
  async getChat(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<Chat | null> {
    return this.chatService.getChatById(chatId, userId);
  }

  @Query(() => [Message], { name: 'chatMessages' })
  async getChatMessages(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @Args('limit', { type: () => Number, defaultValue: 50 }) limit: number,
    @Args('offset', { type: () => Number, defaultValue: 0 }) offset: number,
  ): Promise<Message[]> {
    return this.chatService.getMessages(chatId, userId, limit, offset);
  }

  @Query(() => [Message], { name: 'recentMessages' })
  async getRecentMessages(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @Args('limit', { type: () => Number, defaultValue: 50 }) limit: number,
  ): Promise<Message[]> {
    return this.chatService.getMessages(chatId, userId, limit, 0);
  }

  @Mutation(() => Chat)
  async createChat(@Args('input') createChatInput: CreateChatInput): Promise<Chat> {
    return this.chatService.createChat(createChatInput);
  }

  @Mutation(() => Chat)
  async joinChat(@Args('input') joinChatInput: JoinChatInput): Promise<Chat> {
    return this.chatService.joinChat(joinChatInput);
  }

  @Mutation(() => Message)
  async sendMessage(@Args('input') sendMessageInput: SendMessageInput): Promise<Message> {
    const message = await this.chatService.sendMessage(sendMessageInput);
    
    // Publish the message to subscribers
    await pubSub.publish('newMessage', {
      newMessage: message,
      chatId: sendMessageInput.chatId,
    });

    return message;
  }

  @Subscription(() => Message, {
    filter: (payload, variables) => {
      return payload.chatId === variables.chatId;
    },
  })
  newMessage(@Args('chatId', { type: () => ID }) chatId: string) {
    return pubSub.asyncIterator('newMessage');
  }
}
