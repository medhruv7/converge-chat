import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { CreateUserInput } from '../dto/user.input';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        isActive: true,
      };

      const expectedUser = {
        id: '1',
        ...createUserInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedUser);
      mockRepository.save.mockResolvedValue(expectedUser);

      const result = await service.create(createUserInput);

      expect(mockRepository.create).toHaveBeenCalledWith(createUserInput);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedUser);
      expect(result).toEqual(expectedUser);
    });

    it('should create a user with default isActive value', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
      };

      const expectedUser = {
        id: '1',
        ...createUserInput,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedUser);
      mockRepository.save.mockResolvedValue(expectedUser);

      const result = await service.create(createUserInput);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createUserInput,
        isActive: true,
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expectedUsers = [
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

      mockRepository.find.mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '1';
      const expectedUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.findOne(userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user not found', async () => {
      const userId = '999';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(userId);

      expect(result).toBeNull();
    });
  });

  describe('findActiveUsers', () => {
    it('should return only active users', async () => {
      const expectedUsers = [
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

      mockRepository.find.mockResolvedValue(expectedUsers);

      const result = await service.findActiveUsers();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '1';
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        ...updateData,
        phoneNumber: '+1234567890',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should return null if user not found', async () => {
      const userId = '999';
      const updateData = { firstName: 'Updated' };

      mockRepository.update.mockResolvedValue({ affected: 0 });

      const result = await service.update(userId, updateData);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const userId = '1';
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(userId);

      expect(mockRepository.delete).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      const userId = '999';
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.remove(userId);

      expect(result).toBe(false);
    });
  });
});
