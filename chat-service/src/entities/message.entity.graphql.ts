import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from './user.entity.graphql';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => User, { nullable: true })
  sender?: User;

  @Field()
  chatId: string;

  @Field()
  sequenceNumber: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
