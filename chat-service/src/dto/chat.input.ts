import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsArray, IsUUID } from 'class-validator';

@InputType()
export class CreateChatInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ defaultValue: 'group' })
  @IsString()
  type: 'public' | 'private' | 'group';

  @Field(() => [String])
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds: string[];
}

@InputType()
export class JoinChatInput {
  @Field()
  @IsUUID('4')
  chatId: string;

  @Field()
  @IsUUID('4')
  userId: string;
}

@InputType()
export class SendMessageInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field()
  @IsUUID('4')
  chatId: string;

  @Field()
  @IsUUID('4')
  senderId: string;
}
