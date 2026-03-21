import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from '@node-rs/argon2';

import { User } from '@database/entities/user.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { ErrorMessages } from '@common/exceptions/error-messages';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly _usersRepository: Repository<User>,
    @InjectRepository(Department) private readonly _departmentRepository: Repository<Department>,
    @InjectRepository(Position) private readonly _positionRepository: Repository<Position>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this._ensureEmailUnique(createUserDto.email);

    const hashedPassword = await argon2.hash(createUserDto.password);

    let department: Department | undefined;
    if (createUserDto.departmentId) {
      department = await this._findDepartmentById(createUserDto.departmentId);
    }

    let position: Position | undefined;
    if (createUserDto.positionId) {
      position = await this._findPositionById(createUserDto.positionId);
    }

    const createdUser = this._usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      department,
      position,
    });

    return this._usersRepository.save(createdUser);
  }

  async findAll(): Promise<User[]> {
    return this._usersRepository.find({
      relations: ['department', 'position'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this._usersRepository.findOne({
      where: { id },
      relations: ['department', 'position'],
    });

    if (!user) throw new NotFoundException(ErrorMessages.USER_NOT_FOUND(id));
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this._usersRepository.findOne({
      where: { email },
      select: { password: true }
    })
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email !== undefined && updateUserDto.email !== user.email) {
      await this._ensureEmailUnique(updateUserDto.email);
    }

    const updateData: Partial<User> = {};

    if (updateUserDto.firstName !== undefined) updateData.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName !== undefined) updateData.lastName = updateUserDto.lastName;
    if (updateUserDto.email !== undefined) updateData.email = updateUserDto.email;
    if (updateUserDto.role !== undefined) updateData.role = updateUserDto.role;
    if (updateUserDto.phone !== undefined) updateData.phone = updateUserDto.phone;

    if (updateUserDto.departmentId !== undefined) {
      updateData.department = updateUserDto.departmentId
        ? await this._findDepartmentById(updateUserDto.departmentId)
        : undefined;
    }

    if (updateUserDto.positionId !== undefined) {
      updateData.position = updateUserDto.positionId
        ? await this._findPositionById(updateUserDto.positionId)
        : undefined;
    }

    const updatedUser = this._usersRepository.merge(user, updateData);
    return this._usersRepository.save(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this._usersRepository.remove(user);
  }

  private async _ensureEmailUnique(email: string): Promise<void> {
    const user = await this._usersRepository.findOne({ where: { email } });
    if (user) throw new ConflictException(ErrorMessages.USER_EMAIL_EXISTS(email));
  }

  private async _findDepartmentById(id: string): Promise<Department> {
    const department = await this._departmentRepository.findOne({ where: { id } });
    if (!department) throw new NotFoundException(ErrorMessages.DEPARTMENT_NOT_FOUND(id));

    return department;
  }

  private async _findPositionById(id: string): Promise<Position> {
    const position = await this._positionRepository.findOne({ where: { id } });
    if (!position) throw new NotFoundException(ErrorMessages.POSITION_NOT_FOUND(id));

    return position;
  }
}