import { ObjectType, Field, ID } from '@nestjs/graphql';
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

  @Field(() => [String])
  participantIds: string[];

  @Field(() => [Message])
  messages: Message[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
