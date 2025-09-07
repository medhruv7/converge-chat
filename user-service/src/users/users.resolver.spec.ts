import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { CreateUserInput } from '../dto/user.input';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findActiveUsers: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        isActive: true,
      };

      const expectedUser: User = {
        id: '1',
        ...createUserInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await resolver.createUser(createUserInput);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserInput);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('users', () => {
    it('should return all users', async () => {
      const expectedUsers: User[] = [
        {
          id: '1',
          email: 'test1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          email: 'test2@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          phoneNumber: '+0987654321',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUsersService.findAll.mockResolvedValue(expectedUsers);

      const result = await resolver.users();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('user', () => {
    it('should return a user by id', async () => {
      const userId = '1';
      const expectedUser: User = {
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findOne.mockResolvedValue(expectedUser);

      const result = await resolver.user(userId);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user not found', async () => {
      const userId = '999';
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await resolver.user(userId);

      expect(result).toBeNull();
    });
  });

  describe('activeUsers', () => {
    it('should return only active users', async () => {
      const expectedUsers: User[] = [
        {
          id: '1',
          email: 'test1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUsersService.findActiveUsers.mockResolvedValue(expectedUsers);

      const result = await resolver.activeUsers();

      expect(mockUsersService.findActiveUsers).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const userId = '1';
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const updatedUser: User = {
        id: userId,
        email: 'test@example.com',
        ...updateData,
        phoneNumber: '+1234567890',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await resolver.updateUser(userId, updateData);

      expect(mockUsersService.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should return null if user not found', async () => {
      const userId = '999';
      const updateData = { firstName: 'Updated' };

      mockUsersService.update.mockResolvedValue(null);

      const result = await resolver.updateUser(userId, updateData);

      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = '1';
      mockUsersService.remove.mockResolvedValue(true);

      const result = await resolver.deleteUser(userId);

      expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      const userId = '999';
      mockUsersService.remove.mockResolvedValue(false);

      const result = await resolver.deleteUser(userId);

      expect(result).toBe(false);
    });
  });
});
