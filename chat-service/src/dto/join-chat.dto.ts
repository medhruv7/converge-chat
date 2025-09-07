import { IsUUID } from 'class-validator';

export class JoinChatDto {
  @IsUUID('4')
  chatId: string;

  @IsUUID('4')
  userId: string;
}
