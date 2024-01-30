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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async create(@Body() createBookingDto: CreateBookingDto) {
    try {
      return this.bookingService.createBooking(createBookingDto);
    } catch (error) {
      throw new InternalServerErrorException('Error creating booking');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({ status: 200, description: 'List of bookings.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async findAll() {
    try {
      return await this.bookingService.findAllBookings();
    } catch (error) {
      throw new InternalServerErrorException('Error finding all rooms');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking details.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async findOne(@Param('id') id: string) {
    const booking = await this.bookingService.findBookingById(+id);

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    try {
      return this.bookingService.updateBooking(+id, updateBookingDto);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating booking with ID ${id}`,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiResponse({ status: 200, description: 'Booking deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async remove(@Param('id') id: string) {
    try {
      return this.bookingService.deleteBooking(+id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error deleting booking with ID ${id}`,
      );
    }
  }
}
