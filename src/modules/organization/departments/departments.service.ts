import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Department } from '@database/entities/department.entity';
import { ErrorMessages } from '@common/exceptions/error-messages';
import { AuthorizedUser } from '@common/types/authorized-user.type';
import { PermissionsService } from '../../permissions/permissions.service';
import { PermissionAction } from '@common/enums/permission-action.enum';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    private permissions: PermissionsService,
  ) {}

  async create(
    createDepartmentDto: CreateDepartmentDto,
    currentUser: AuthorizedUser,
  ): Promise<Department> {
    this.permissions.assertCan(currentUser, PermissionAction.DEPARTMENT_CREATE);

    const existing = await this.departmentsRepository.findOne({
      where: {
        name: createDepartmentDto.name,
        company: { id: currentUser.companyId },
      },
    });

    if (existing) {
      throw new ConflictException(ErrorMessages.DEPARTMENT_NAME_EXISTS(createDepartmentDto.name));
    }

    const department = this.departmentsRepository.create({
      ...createDepartmentDto,
      company: { id: currentUser.companyId },
    });

    return this.departmentsRepository.save(department);
  }

  async findAll(currentUser: AuthorizedUser): Promise<Department[]> {
    this.permissions.assertCan(currentUser, PermissionAction.DEPARTMENT_READ);

    return this.departmentsRepository.find({
      where: { company: { id: currentUser.companyId } },
    });
  }

  async findOne(id: string, currentUser: AuthorizedUser): Promise<Department> {
    const department = await this.departmentsRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!department) throw new NotFoundException(ErrorMessages.DEPARTMENT_NOT_FOUND(id));

    this.permissions.assertCan(currentUser, PermissionAction.DEPARTMENT_READ, department);

    return department;
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
    currentUser: AuthorizedUser,
  ): Promise<Department> {
    const department = await this.findOne(id, currentUser);

    this.permissions.assertCan(currentUser, PermissionAction.DEPARTMENT_UPDATE, department);

    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existing = await this.departmentsRepository.findOne({
        where: {
          name: updateDepartmentDto.name,
          company: { id: currentUser.companyId },
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(ErrorMessages.DEPARTMENT_NAME_EXISTS(updateDepartmentDto.name));
      }
    }

    Object.assign(department, updateDepartmentDto);
    return this.departmentsRepository.save(department);
  }

  async remove(id: string, currentUser: AuthorizedUser): Promise<void> {
    const department = await this.findOne(id, currentUser);

    this.permissions.assertCan(currentUser, PermissionAction.DEPARTMENT_DELETE, department);

    await this.departmentsRepository.remove(department);
  }
}
