import { Test, TestingModule } from '@nestjs/testing';
import { Booking, BookingStatus, Room, User } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ProducerService } from '../queue/producer.service';
import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;
  let prismaClientMock: DeepMockProxy<PrismaService>;
  let cacheServiceMock: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let configServiceMock: { get: jest.Mock };
  let producerServiceMock: { addToEmailQueue: jest.Mock };
  let cacheKey: string;

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
      }),
    };
    producerServiceMock = {
      addToEmailQueue: jest.fn(),
    };
    cacheKey = 'availability';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: ConfigService, useValue: configServiceMock },
        { provide: PrismaService, useValue: prismaClientMock },
        { provide: 'CACHE_MANAGER', useValue: cacheServiceMock },
        { provide: ProducerService, useValue: producerServiceMock },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a booking and invalidate cache', async () => {
    const booking: Booking = {
      id: 1,
      roomId: 1,
      userId: 1,
      status: BookingStatus.CONFIRMED,
      startTime: new Date(),
      endTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaClientMock.booking.create.mockResolvedValue(booking);
    await expect(service.createBooking(booking)).resolves.toEqual(booking);
    expect(cacheServiceMock.del).toHaveBeenCalledWith(`${cacheKey}:*`);
  });

  it('should retrieve all rooms', async () => {
    const bookings: Booking[] = [
      {
        id: 1,
        roomId: 1,
        userId: 1,
        status: BookingStatus.CONFIRMED,
        startTime: new Date(),
        endTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        roomId: 2,
        userId: 1,
        status: BookingStatus.CONFIRMED,
        startTime: new Date(),
        endTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prismaClientMock.booking.findMany.mockResolvedValue(bookings);

    await expect(service.findAllBookings()).resolves.toEqual(bookings);
  });

  it('should find a booking by ID', async () => {
    const booking: Booking = {
      id: 1,
      roomId: 1,
      userId: 1,
      status: BookingStatus.CONFIRMED,
      startTime: new Date(),
      endTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaClientMock.booking.findUnique.mockResolvedValue(booking);

    const bookingId = 1;
    await expect(service.findBookingById(bookingId)).resolves.toEqual(booking);
  });

  it('should cancel a booking and invalidate cache', async () => {
    const payload = {
      status: BookingStatus.CANCELLED,
      startTime: new Date(),
      endTime: new Date(),
    };

    const booking: Booking = {
      id: 1,
      roomId: 1,
      userId: 1,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaClientMock.booking.update.mockResolvedValue(booking);

    const bookingId = 1;
    await expect(service.updateBooking(bookingId, payload)).resolves.toEqual(
      booking,
    );
    expect(cacheServiceMock.del).toHaveBeenCalledWith(`${cacheKey}:*`);
  });

  it('should confirm a booking, invalidate cache and run async message producer', async () => {
    const payload = {
      status: BookingStatus.CONFIRMED,
      startTime: new Date(),
      endTime: new Date(),
    };

    const booking: Booking = {
      id: 1,
      roomId: 1,
      userId: 1,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user: User = {
      id: 1,
      name: 'John Doe',
      email: 'johny@nest.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const room: Room = {
      id: 1,
      name: 'Room 1',
      description: 'Nice room.',
      capacity: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaClientMock.booking.findFirstOrThrow.mockResolvedValue({
      ...booking,
      user,
      room,
    } as Booking & {
      user: User;
      room: Room;
    });

    prismaClientMock.booking.update.mockResolvedValue(booking);

    const bookingId = 1;
    await expect(service.updateBooking(bookingId, payload)).resolves.toEqual(
      booking,
    );
    expect(producerServiceMock.addToEmailQueue).toHaveBeenCalledWith(
      user,
      room,
    );
    expect(cacheServiceMock.del).toHaveBeenCalledWith(`${cacheKey}:*`);
  });

  it('should delete a booking and invalidate cache', async () => {
    const bookingId = 1;

    const booking: Booking = {
      id: bookingId,
      roomId: 1,
      userId: 1,
      status: BookingStatus.CONFIRMED,
      startTime: new Date(),
      endTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaClientMock.booking.delete.mockResolvedValue(booking);

    await expect(service.deleteBooking(bookingId)).resolves.toEqual(booking);
    expect(cacheServiceMock.del).toHaveBeenCalledWith(`${cacheKey}:*`);
  });

  it('should return null if findBookingById does not find a booking', async () => {
    prismaClientMock.booking.findUnique.mockResolvedValue(null);
    const bookingId = 999;
    await expect(service.findBookingById(bookingId)).resolves.toBeNull();
  });
});
