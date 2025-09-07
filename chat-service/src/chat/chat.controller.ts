import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from '../dto/create-chat.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { JoinChatDto } from '../dto/join-chat.dto';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createChat(@Body(ValidationPipe) createChatDto: CreateChatDto): Promise<Chat> {
    return await this.chatService.createChat(createChatDto);
  }

  @Get('user/:userId')
  async getUserChats(@Param('userId') userId: string): Promise<Chat[]> {
    return await this.chatService.getChats(userId);
  }

  @Get(':chatId/user/:userId')
  async getChat(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ): Promise<Chat> {
    return await this.chatService.getChatById(chatId, userId);
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  async joinChat(@Body(ValidationPipe) joinChatDto: JoinChatDto): Promise<Chat> {
    return await this.chatService.joinChat(joinChatDto);
  }

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(@Body(ValidationPipe) sendMessageDto: SendMessageDto): Promise<Message> {
    return await this.chatService.sendMessage(sendMessageDto);
  }

  @Get(':chatId/messages')
  async getMessages(
    @Param('chatId') chatId: string,
    @Query('userId') userId: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ): Promise<Message[]> {
    return await this.chatService.getMessages(chatId, userId, limit, offset);
  }

  @Get(':chatId/messages/recent')
  async getRecentMessages(
    @Param('chatId') chatId: string,
    @Query('limit') limit: number = 50,
  ): Promise<any[]> {
    return await this.chatService.getRecentMessages(chatId, limit);
  }
}
