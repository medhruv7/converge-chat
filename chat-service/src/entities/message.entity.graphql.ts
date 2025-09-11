import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field()
  senderId: string;

  @Field()
  chatId: string;

  @Field()
  sequenceNumber: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
