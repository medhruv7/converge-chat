import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(['text', 'image', 'file', 'system'])
  type?: 'text' | 'image' | 'file' | 'system';

  @IsUUID('4')
  chatId: string;

  @IsUUID('4')
  senderId: string;
}
