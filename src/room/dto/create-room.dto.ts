import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'Conference Room', description: 'Name of the room' })
  @IsString()
  @MaxLength(100)
  readonly name: string;

  @ApiProperty({ example: 10, description: 'Capacity of the room' })
  @IsInt()
  @Min(1)
  readonly capacity: number;

  @ApiProperty({
    example: 'A spacious room with audio-visual equipment',
    description: 'Description of the room',
    required: false,
  })
  @IsString()
  @MaxLength(500)
  readonly description: string;
}
