import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity.graphql';
import { CreateUserInput, UpdateUserInput } from '../dto/user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  async getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => [User], { name: 'activeUsers' })
  async getActiveUsers(): Promise<User[]> {
    return this.usersService.findActive();
  }

  @Query(() => User, { name: 'user', nullable: true })
  async getUser(@Args('id', { type: () => ID }) id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  async createUser(@Args('input') createUserInput: CreateUserInput): Promise<User> {
    return this.usersService.create(createUserInput);
  }

  @Mutation(() => User, { nullable: true })
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateUserInput: UpdateUserInput,
  ): Promise<User | null> {
    return this.usersService.update(id, updateUserInput);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.usersService.remove(id);
  }
}
