import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '@database/entities/user.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { UserRole } from '@database/entities/user.entity.enums';
import { ErrorMessages } from '@common/exceptions/error-messages';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';

import { AuthorizedUser } from '../auth/auth.types';
import { PaginationService } from '@common/pagination/pagination.service';
import { UserFilterBuilder } from './user-filter.builder';
import { PaginatedResult } from '@common/pagination/pagination.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly _usersRepository: Repository<User>,
    @InjectRepository(Department) private readonly _departmentRepository: Repository<Department>,
    @InjectRepository(Position) private readonly _positionRepository: Repository<Position>,
    private readonly _paginationService: PaginationService,
    private readonly _userFilterBuilder: UserFilterBuilder,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this._ensureEmailUnique(createUserDto.email);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    let department: Department | undefined;
    if (createUserDto.departmentId) {
      department = await this._findDepartmentById(createUserDto.departmentId);
    }

    let position: Position | undefined;
    if (createUserDto.positionId) {
      position = await this._findPositionById(createUserDto.positionId);
    }

    const createdUser = this._usersRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      password: hashedPassword,
      phone: createUserDto.phone,
      department,
      position,
      role: UserRole.EMPLOYEE,
    });

    return this._usersRepository.save(createdUser);
  }

  async findAll(): Promise<User[]> {
    return this._usersRepository.find({
      relations: ['department', 'position'],
    });
  }

  async findAllPaginated(
    filters: UserFilterDto,
    currentUser: AuthorizedUser,
  ): Promise<PaginatedResult<User>> {
    const queryBuilder = this._usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .leftJoinAndSelect('user.position', 'position');

    this._userFilterBuilder.buildFilters(queryBuilder, filters);

    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'DESC';

    this._userFilterBuilder.applySorting(queryBuilder, sortBy, sortOrder);

    if (currentUser.role !== UserRole.HR) {
      queryBuilder.andWhere('user.id = :userId', { userId: currentUser.id });
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    return this._paginationService.paginate(queryBuilder, page, limit);
  }

  async findOne(id: string, currentUser: AuthorizedUser): Promise<User> {
    if (currentUser.role !== UserRole.HR && currentUser.id !== id) {
      throw new ForbiddenException(
        ErrorMessages.FORBIDDEN_RESOURCE_ACCESS(UserRole.HR),
      );
    }

    return this.findById(id);
  }

  async findById(id: string): Promise<User> {
    const user = await this._usersRepository.findOne({
      where: { id },
      relations: ['department', 'position'],
    });

    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND(id));
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this._usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .leftJoinAndSelect('user.position', 'position')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: AuthorizedUser,
  ): Promise<User> {
    const user = await this.findOne(id, currentUser);

    if (
      updateUserDto.email !== undefined &&
      updateUserDto.email !== user.email
    ) {
      await this._ensureEmailUnique(updateUserDto.email);
    }

    const updateData: Partial<User> = {};

    if (updateUserDto.firstName !== undefined)
      updateData.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName !== undefined)
      updateData.lastName = updateUserDto.lastName;
    if (updateUserDto.email !== undefined)
      updateData.email = updateUserDto.email;
    if (updateUserDto.phone !== undefined)
      updateData.phone = updateUserDto.phone;
    if (updateUserDto.avatar !== null) updateData.avatar = updateUserDto.avatar;

    if (currentUser.role === UserRole.HR) {
      if (updateUserDto.departmentId !== undefined) {
        updateData.department = await this._findDepartmentById(
          updateUserDto.departmentId,
        );
      }

      if (updateUserDto.positionId !== undefined) {
        updateData.position = await this._findPositionById(
          updateUserDto.positionId,
        );
      }
    }

    const updatedUser = this._usersRepository.merge(user, updateData);
    return this._usersRepository.save(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this._usersRepository.remove(user);
  }

  private async _ensureEmailUnique(email: string): Promise<void> {
    const user = await this._usersRepository.findOne({ where: { email } });
    if (user)
      throw new ConflictException(ErrorMessages.USER_EMAIL_EXISTS(email));
  }

  private async _findDepartmentById(id: string): Promise<Department> {
    const department = await this._departmentRepository.findOne({
      where: { id },
    });
    if (!department)
      throw new NotFoundException(ErrorMessages.DEPARTMENT_NOT_FOUND(id));

    return department;
  }

  private async _findPositionById(id: string): Promise<Position> {
    const position = await this._positionRepository.findOne({ where: { id } });
    if (!position)
      throw new NotFoundException(ErrorMessages.POSITION_NOT_FOUND(id));

    return position;
  }
}
