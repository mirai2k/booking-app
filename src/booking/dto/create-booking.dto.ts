import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { IsDateString, IsIn, IsInt, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'ID of the room' })
  @IsInt()
  @IsNotEmpty()
  readonly roomId: number;

  @ApiProperty({ example: 1, description: 'ID of the user' })
  @IsInt()
  @IsNotEmpty()
  readonly userId: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Start time of the booking',
  })
  @IsDateString()
  @IsNotEmpty()
  readonly startTime: Date;

  @ApiProperty({
    example: '2024-01-02T00:00:00.000Z',
    description: 'End time of the booking',
  })
  @IsDateString()
  @IsNotEmpty()
  readonly endTime: Date;

  @ApiProperty({ enum: BookingStatus, description: 'Status of the booking' })
  @IsIn([BookingStatus.PENDING])
  readonly status: BookingStatus;
}
