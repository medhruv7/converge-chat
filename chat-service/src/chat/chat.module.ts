import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatResolver } from './chat.resolver';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { RedisModule } from '../redis/redis.module';
import { UserService } from '../services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message]),
    RedisModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ChatResolver, UserService],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
