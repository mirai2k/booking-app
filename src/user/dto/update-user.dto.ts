import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The updated name of the user',
    example: 'Jane Doe',
    required: false,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  readonly name?: string;

  @ApiProperty({
    description: 'The updated email of the user',
    example: 'jane@example.com',
    required: false,
  })
  @IsEmail()
  @MaxLength(100)
  @IsOptional()
  readonly email?: string;
}
