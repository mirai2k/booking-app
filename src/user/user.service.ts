import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({ data: dto });
  }

  async findAllUsers(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }

  async findUserById(id: number): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data: dto,
    });
  }

  async deleteUser(id: number): Promise<User> {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
