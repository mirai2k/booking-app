import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateRoomDto {
  @ApiProperty({
    example: 'Updated Room Name',
    description: 'New name of the room',
    required: false,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  readonly name?: string;

  @ApiProperty({
    example: 15,
    description: 'Updated capacity of the room',
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly capacity?: number;

  @ApiProperty({
    example: 'New description of the room',
    description: 'Updated description of the room',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  readonly description?: string;
}
