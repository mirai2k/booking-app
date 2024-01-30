import { Test, TestingModule } from '@nestjs/testing';
import { Room } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CheckRoomAvailabilityDto } from './dto/check-room-availability.dto';
import { RoomService } from './room.service';

describe('RoomService', () => {
  let service: RoomService;
  let prismaClientMock: DeepMockProxy<PrismaService>;
  let cacheServiceMock: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let configServiceMock: { get: jest.Mock };
  let checkAvailabilitySpy: jest.SpyInstance;
  let cacheKey: string;
  let cacheTTL: number;

  beforeEach(async () => {
    prismaClientMock = mockDeep<PrismaService>();
    cacheServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };
    configServiceMock = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'REDIS_CACHE_KEY') return 'availability';
        if (key === 'REDIS_CACHE_TTL') return 600;
      }),
    };
    cacheKey = 'availability';
    cacheTTL = 600;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        { provide: ConfigService, useValue: configServiceMock },
        { provide: PrismaService, useValue: prismaClientMock },
        { provide: 'CACHE_MANAGER', useValue: cacheServiceMock },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    checkAvailabilitySpy = jest.spyOn(service, 'checkAvailability');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a room', async () => {
    const room: Room = {
      id: 1,
      name: 'Room 1',
      description: 'Nice room',
      capacity: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaClientMock.room.create.mockResolvedValue(room);
    await expect(service.createRoom(room)).resolves.toEqual(room);
  });

  it('should find a room by ID', async () => {
    const room: Room = {
      id: 1,
      name: 'Room 1',
      description: 'Nice room',
      capacity: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaClientMock.room.findUnique.mockResolvedValue(room);

    const roomId = 1;
    await expect(service.findRoomById(roomId)).resolves.toEqual(room);
  });

  it('should update a room', async () => {
    const payload = {
      name: 'Room 1',
      description: 'Nice room',
      capacity: 2,
    };

    const room: Room = {
      id: 1,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaClientMock.room.update.mockResolvedValue(room);

    const roomId = 1;
    await expect(service.updateRoom(roomId, payload)).resolves.toEqual(room);
  });

  it('should delete a room', async () => {
    const roomId = 1;

    const room: Room = {
      id: roomId,
      name: 'Room 1',
      description: 'Nice room',
      capacity: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaClientMock.room.delete.mockResolvedValue(room);

    await expect(service.deleteRoom(roomId)).resolves.toEqual(room);
  });

  it('should retrieve all rooms', async () => {
    const rooms: Room[] = [
      {
        id: 1,
        name: 'Room 1',
        description: 'Nice room',
        capacity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Room 2',
        description: 'Nice room',
        capacity: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prismaClientMock.room.findMany.mockResolvedValue(rooms);

    await expect(service.findAllRooms()).resolves.toEqual(rooms);
  });

  it('should check availability of the rooms with database (first call)', async () => {
    const dto: CheckRoomAvailabilityDto = {
      startTime: '2024-07-30T12:19:25.633Z',
      endTime: '2024-07-31T12:19:25.633Z',
    };

    const availabilityCacheKey = `${cacheKey}:${dto.startTime}-${dto.endTime}`;

    const rooms: Room[] = [
      {
        id: 1,
        name: 'Room 1',
        description: 'Nice room',
        capacity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Room 2',
        description: 'Nice room',
        capacity: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prismaClientMock.room.findMany.mockResolvedValue(rooms);

    await expect(service.checkAvailability(dto)).resolves.toEqual(rooms);
    expect(checkAvailabilitySpy).toHaveBeenCalledTimes(1);
    expect(cacheServiceMock.set).toHaveBeenCalledWith(
      availabilityCacheKey,
      rooms,
      cacheTTL,
    );
  });

  it('should check availability of the rooms with cache (second call)', async () => {
    const dto: CheckRoomAvailabilityDto = {
      startTime: '2024-07-30T12:19:25.633Z',
      endTime: '2024-07-31T12:19:25.633Z',
    };

    const availabilityCacheKey = `${cacheKey}:${dto.startTime}-${dto.endTime}`;

    const rooms: Room[] = [
      {
        id: 1,
        name: 'Room 1',
        description: 'Nice room',
        capacity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Room 2',
        description: 'Nice room',
        capacity: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    cacheServiceMock.get.mockResolvedValue(rooms);

    await expect(service.checkAvailability(dto)).resolves.toEqual(rooms);
    expect(checkAvailabilitySpy).toHaveBeenCalledTimes(1);
    expect(cacheServiceMock.get).toHaveBeenCalledWith(availabilityCacheKey);
  });

  it('should return null if findRoomById does not find a room', async () => {
    prismaClientMock.room.findUnique.mockResolvedValue(null);
    const roomId = 999;
    await expect(service.findRoomById(roomId)).resolves.toBeNull();
  });
});
