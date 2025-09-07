import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from './user.entity.graphql';
import { Message } from './message.entity.graphql';

@ObjectType()
export class Chat {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  type: string;

  @Field(() => [User])
  participants: User[];

  @Field(() => [Message])
  messages: Message[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
