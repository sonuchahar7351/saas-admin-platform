import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findAll(requestingUser: { userId: string; role: string }) {
    return this.usersRepository.findAll(requestingUser);
  }

  async create(dto: CreateUserDto, createdById: string) {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.usersRepository.create({
      ...dto,
      password: hashedPassword,
      createdById,
    });
  }
}
