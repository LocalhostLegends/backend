import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveType } from '@database/entities/leave-type.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { CreateLeaveTypeDto, UpdateLeaveTypeDto } from './dto/leave-type.dto';

@Injectable()
export class LeaveTypesService {
  constructor(
    @InjectRepository(LeaveType)
    private readonly leaveTypeRepository: Repository<LeaveType>,
    private readonly permissions: PermissionsService,
  ) {}

  async create(dto: CreateLeaveTypeDto, currentUser: AuthorizedUser): Promise<LeaveType> {
    await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_TYPE_CREATE);

    const existing = await this.leaveTypeRepository.findOne({
      where: { code: dto.code, companyId: currentUser.companyId },
    });

    if (existing) {
      throw ExceptionFactory.leaveTypeCodeExists(dto.code);
    }

    const leaveType = this.leaveTypeRepository.create({
      ...dto,
      companyId: currentUser.companyId,
    });

    return this.leaveTypeRepository.save(leaveType);
  }

  async findAll(currentUser: AuthorizedUser): Promise<LeaveType[]> {
    await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_TYPE_READ);

    return this.leaveTypeRepository.find({
      where: { companyId: currentUser.companyId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, currentUser: AuthorizedUser): Promise<LeaveType> {
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { id, companyId: currentUser.companyId },
    });

    if (!leaveType) {
      throw ExceptionFactory.leaveTypeNotFound(id);
    }

    await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_TYPE_READ);

    return leaveType;
  }

  async update(
    id: string,
    dto: UpdateLeaveTypeDto,
    currentUser: AuthorizedUser,
  ): Promise<LeaveType> {
    const leaveType = await this.findOne(id, currentUser);

    await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_TYPE_UPDATE);

    Object.assign(leaveType, dto);
    return this.leaveTypeRepository.save(leaveType);
  }

  async remove(id: string, currentUser: AuthorizedUser): Promise<void> {
    const leaveType = await this.findOne(id, currentUser);

    await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_TYPE_DELETE);

    await this.leaveTypeRepository.remove(leaveType);
  }
}
