import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let prismaClientMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaClientMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaClientMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      email: 'johny@nest.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaClientMock.user.create.mockResolvedValue(user);
    await expect(service.createUser(user)).resolves.toEqual(user);
  });

  it('should find a user by ID', async () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      email: 'johny@nest.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaClientMock.user.findUnique.mockResolvedValue(user);

    const userId = 1;
    await expect(service.findUserById(userId)).resolves.toEqual(user);
  });

  it('should update a user', async () => {
    const payload = {
      name: 'John Doe',
      email: 'johny@nest.com',
    };

    const user: User = {
      id: 1,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaClientMock.user.update.mockResolvedValue(user);

    const userId = 1;
    await expect(service.updateUser(userId, payload)).resolves.toEqual(user);
  });

  it('should delete a user', async () => {
    const userId = 1;

    const user: User = {
      id: userId,
      name: 'John Doe',
      email: 'johny@nest.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaClientMock.user.delete.mockResolvedValue(user);

    await expect(service.deleteUser(userId)).resolves.toEqual(user);
  });

  it('should retrieve all users', async () => {
    const users: User[] = [
      {
        id: 1,
        name: 'John Doe',
        email: 'johny@nest.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Jane Doe',
        email: 'joney@nest.js',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prismaClientMock.user.findMany.mockResolvedValue(users);

    await expect(service.findAllUsers()).resolves.toEqual(users);
  });

  it('should return null if findUserById does not find a user', async () => {
    prismaClientMock.user.findUnique.mockResolvedValue(null);
    const userId = 999;
    await expect(service.findUserById(userId)).resolves.toBeNull();
  });
});
