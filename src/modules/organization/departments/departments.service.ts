import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Department } from '@database/entities/department.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { CustomFieldsService } from '@modules/custom-fields/custom-fields.service';
import { EntityType } from '@common/enums/entity-type.enum';
import { CustomFieldsMap } from '@modules/custom-fields/custom-fields.types';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

export type DepartmentWithCustomFields = Department & { customFields: CustomFieldsMap };

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    private readonly permissions: PermissionsService,
    private readonly _customFieldsService: CustomFieldsService,
  ) {}

  async create(
    createDepartmentDto: CreateDepartmentDto,
    currentUser: AuthorizedUser,
  ): Promise<DepartmentWithCustomFields> {
    await this.permissions.assertCan(currentUser, PermissionAction.DEPARTMENT_CREATE);

    const { customFields, ...departmentData } = createDepartmentDto;

    const existing = await this.departmentsRepository.findOne({
      where: {
        name: departmentData.name,
        company: { id: currentUser.companyId },
      },
    });

    if (existing) {
      throw ExceptionFactory.departmentNameExists(departmentData.name);
    }

    const department = this.departmentsRepository.create({
      ...departmentData,
      company: { id: currentUser.companyId },
    });

    const saved = await this.departmentsRepository.save(department);

    if (customFields) {
      await this._customFieldsService.setValues(
        currentUser.companyId,
        EntityType.DEPARTMENT,
        saved.id,
        customFields,
      );
    }

    return this.findOne(saved.id, currentUser);
  }

  async findAll(currentUser: AuthorizedUser): Promise<DepartmentWithCustomFields[]> {
    await this.permissions.assertCan(currentUser, PermissionAction.DEPARTMENT_READ);

    const departments = await this.departmentsRepository.find({
      where: { company: { id: currentUser.companyId } },
    });

    if (departments.length === 0) return [];

    const deptIds = departments.map((d) => d.id);
    const allCustomFields = await this._customFieldsService.getValuesForMultipleEntities(
      currentUser.companyId,
      EntityType.DEPARTMENT,
      deptIds,
    );

    const customFieldsMap = new Map<string, CustomFieldsMap>();
    allCustomFields.forEach((cf) => {
      let entry = customFieldsMap.get(cf.entityId);
      if (!entry) {
        entry = {};
        customFieldsMap.set(cf.entityId, entry);
      }
      entry[cf.fieldKey] = cf.value;
    });

    return departments.map((d) => ({
      ...d,
      customFields: customFieldsMap.get(d.id) || {},
    }));
  }

  async findOne(id: string, currentUser: AuthorizedUser): Promise<DepartmentWithCustomFields> {
    const department = await this.departmentsRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!department) throw ExceptionFactory.departmentNotFound(id);

    await this.permissions.assertCan(currentUser, PermissionAction.DEPARTMENT_READ, department);

    const customFields = await this._customFieldsService.getValues(
      currentUser.companyId,
      EntityType.DEPARTMENT,
      department.id,
    );

    return {
      ...department,
      customFields,
    };
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
    currentUser: AuthorizedUser,
  ): Promise<DepartmentWithCustomFields> {
    const department = await this.findOne(id, currentUser);

    await this.permissions.assertCan(currentUser, PermissionAction.DEPARTMENT_UPDATE, department);

    const { customFields, ...departmentData } = updateDepartmentDto;

    if (departmentData.name && departmentData.name !== department.name) {
      const existing = await this.departmentsRepository.findOne({
        where: {
          name: departmentData.name,
          company: { id: currentUser.companyId },
        },
      });

      if (existing && existing.id !== id) {
        throw ExceptionFactory.departmentNameExists(departmentData.name);
      }
    }

    Object.assign(department, departmentData);
    const saved = await this.departmentsRepository.save(department);

    if (customFields !== undefined) {
      await this._customFieldsService.setValues(
        currentUser.companyId,
        EntityType.DEPARTMENT,
        saved.id,
        customFields,
      );
    }

    return this.findOne(saved.id, currentUser);
  }

  async remove(id: string, currentUser: AuthorizedUser): Promise<void> {
    const department = await this.findOne(id, currentUser);

    await this.permissions.assertCan(currentUser, PermissionAction.DEPARTMENT_DELETE, department);

    await this.departmentsRepository.remove(department);
  }
}
