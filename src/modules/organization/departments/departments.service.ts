import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Department } from '@database/entities/department.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';
import { ExceptionFactory } from '@common/exceptions/exception-factory';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    private readonly permissions: PermissionsService,
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
      throw ExceptionFactory.departmentNameExists(createDepartmentDto.name);
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

    if (!department) throw ExceptionFactory.departmentNotFound(id);

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
        throw ExceptionFactory.departmentNameExists(updateDepartmentDto.name);
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
