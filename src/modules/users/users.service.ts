import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from '@node-rs/argon2';

import { User } from '@database/entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly _usersRepository: Repository<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this._ensureEmailUnique(createUserDto.email);

    const hashedPassword = await argon2.hash(createUserDto.password);
    const createdUser = this._usersRepository.create({ ...createUserDto, password: hashedPassword });

    return this._usersRepository.save(createdUser);
  }

  async findAll(): Promise<User[]> {
    return this._usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this._usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email !== undefined && updateUserDto.email !== user.email) {
      await this._ensureEmailUnique(updateUserDto.email)
    }

    const updatedUser = this._usersRepository.merge(user, updateUserDto);

    return this._usersRepository.save(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    await this._usersRepository.remove(user);
  }

  private async _ensureEmailUnique(email: string): Promise<void> {
    const user = await this._usersRepository.findOne({ where: { email } });

    if (user) {
      throw new ConflictException(`User with email "${email}" already exists`);
    }
  }
}