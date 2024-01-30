import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Booking, BookingStatus } from '@prisma/client';
import { Cache } from 'cache-manager';

import { PrismaService } from '../prisma/prisma.service';
import { ProducerService } from '../queue/producer.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  private readonly cacheKey: string;

  constructor(
    @Inject('CACHE_MANAGER') private cacheService: Cache,
    private readonly prismaService: PrismaService,
    private readonly producerService: ProducerService,
    private readonly configService: ConfigService,
  ) {
    this.cacheKey = this.configService.get<string>('REDIS_CACHE_KEY') as string;
  }

  async createBooking(dto: CreateBookingDto): Promise<Booking> {
    await this.cacheService.del(`${this.cacheKey}:*`);

    return this.prismaService.booking.create({
      data: dto,
    });
  }

  async findAllBookings(): Promise<Booking[]> {
    return this.prismaService.booking.findMany();
  }

  async findBookingById(id: number): Promise<Booking | null> {
    return this.prismaService.booking.findUnique({ where: { id } });
  }

  async updateBooking(id: number, dto: UpdateBookingDto): Promise<Booking> {
    if (dto.status === BookingStatus.CONFIRMED) {
      const booking = await this.prismaService.booking.findFirstOrThrow({
        where: { id },
        include: {
          room: true,
          user: true,
        },
      });

      const { user, room } = booking;
      await this.producerService.addToEmailQueue(user, room);
    }

    await this.cacheService.del(`${this.cacheKey}:*`);

    return this.prismaService.booking.update({
      where: { id },
      data: dto,
    });
  }

  async deleteBooking(id: number): Promise<Booking> {
    const booking = await this.prismaService.booking.delete({
      where: { id },
    });

    await this.cacheService.del(`${this.cacheKey}:*`);

    return booking;
  }
}
