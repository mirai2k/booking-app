import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class UpdateBookingDto {
  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    description: 'Updated start time of the booking',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  readonly startTime?: Date;

  @ApiProperty({
    example: '2024-01-02T12:00:00.000Z',
    description: 'Updated end time of the booking',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  readonly endTime?: Date;

  @ApiProperty({
    enum: BookingStatus,
    description: 'Updated status of the booking',
  })
  @IsIn([
    BookingStatus.CONFIRMED,
    BookingStatus.PENDING,
    BookingStatus.CANCELLED,
  ])
  readonly status: BookingStatus;
}
