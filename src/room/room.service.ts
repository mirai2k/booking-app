import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BookingStatus, Room } from '@prisma/client';
import { Cache } from 'cache-manager';

import { PrismaService } from '../prisma/prisma.service';
import { CheckRoomAvailabilityDto } from './dto/check-room-availability.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
  private readonly cacheKey: string;
  private readonly cacheTTL: number;

  constructor(
    @Inject('CACHE_MANAGER') private cacheService: Cache,
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {
    this.cacheKey = this.configService.get<string>('REDIS_CACHE_KEY') as string;
    this.cacheTTL = this.configService.get<number>('REDIS_CACHE_TTL') as number;
  }

  async checkAvailability(dto: CheckRoomAvailabilityDto): Promise<Room[]> {
    const { startTime, endTime } = dto;
    const cacheKey = `${this.cacheKey}:${startTime}-${endTime}`;

    const cachedData = await this.cacheService.get<Room[] | null>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const rooms = await this.prismaService.room.findMany({
      where: {
        bookings: {
          none: {
            OR: [
              {
                startTime: {
                  lt: endTime,
                },
                endTime: {
                  gt: startTime,
                },
                status: {
                  not: BookingStatus.CANCELLED,
                },
              },
            ],
          },
        },
      },
    });

    await this.cacheService.set(cacheKey, rooms, this.cacheTTL);
    return rooms;
  }

  async createRoom(dto: CreateRoomDto): Promise<Room> {
    return this.prismaService.room.create({ data: dto });
  }

  async findAllRooms(): Promise<Room[]> {
    return this.prismaService.room.findMany();
  }

  async findRoomById(id: number): Promise<Room | null> {
    return this.prismaService.room.findUnique({
      where: { id },
    });
  }

  async updateRoom(id: number, dto: UpdateRoomDto): Promise<Room> {
    return this.prismaService.room.update({
      where: { id },
      data: dto,
    });
  }

  async deleteRoom(id: number): Promise<Room> {
    return this.prismaService.room.delete({
      where: { id },
    });
  }
}
