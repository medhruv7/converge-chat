import { IsString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';

export class CreateChatDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['public', 'private', 'group'])
  type: 'public' | 'private' | 'group';

  @IsArray()
  @IsUUID('4', { each: true })
  participantIds: string[];
}
