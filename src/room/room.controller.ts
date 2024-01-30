import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CheckRoomAvailabilityDto } from './dto/check-room-availability.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomService } from './room.service';

@ApiTags('rooms')
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get('availability')
  @ApiOperation({ summary: 'Check room availability' })
  @ApiResponse({ status: 200, description: 'List of available rooms.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async checkAvailability(
    @Query() checkRoomAvailabilityDto: CheckRoomAvailabilityDto,
  ) {
    try {
      return await this.roomService.checkAvailability(checkRoomAvailabilityDto);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error checking room availability',
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({ status: 201, description: 'Room created successfully.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async create(@Body() createRoomDto: CreateRoomDto) {
    try {
      return await this.roomService.createRoom(createRoomDto);
    } catch (error) {
      throw new InternalServerErrorException('Error creating room');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({ status: 200, description: 'List of rooms.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async findAll() {
    try {
      return await this.roomService.findAllRooms();
    } catch (error) {
      throw new InternalServerErrorException('Error finding all rooms');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by ID' })
  @ApiResponse({ status: 200, description: 'Room details.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  async findOne(@Param('id') id: string) {
    try {
      const room = await this.roomService.findRoomById(+id);
      if (!room) {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
      return room;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding room with ID ${id}`,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a room by ID' })
  @ApiResponse({ status: 200, description: 'Room updated successfully.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    try {
      return await this.roomService.updateRoom(+id, updateRoomDto);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating room with ID ${id}`,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room by ID' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  async remove(@Param('id') id: string) {
    try {
      return await this.roomService.deleteRoom(+id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error deleting room with ID ${id}`,
      );
    }
  }
}
