import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class CheckRoomAvailabilityDto {
  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Start time of availability check',
  })
  @IsNotEmpty()
  @IsDateString()
  readonly startTime: string;

  @ApiProperty({
    example: '2024-01-02T00:00:00.000Z',
    description: 'End time of availability check',
  })
  @IsNotEmpty()
  @IsDateString()
  readonly endTime: string;
}
