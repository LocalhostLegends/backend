import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveBalance } from '@database/entities/leave-balance.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';

@Injectable()
export class LeaveBalancesService {
  constructor(
    @InjectRepository(LeaveBalance)
    private readonly balanceRepository: Repository<LeaveBalance>,
    private readonly permissions: PermissionsService,
  ) {}

  async findByEmployee(employeeId: string, currentUser: AuthorizedUser): Promise<LeaveBalance[]> {
    if (employeeId === currentUser.id) {
      await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_BALANCE_READ);
    } else {
      await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_BALANCE_READ_ALL);
    }

    return this.balanceRepository.find({
      where: { employeeId },
      relations: ['leaveType'],
    });
  }

  async findOne(employeeId: string, leaveTypeId: string): Promise<LeaveBalance | null> {
    return this.balanceRepository.findOne({
      where: { employeeId, leaveTypeId },
    });
  }

  async ensureBalance(
    employeeId: string,
    leaveTypeId: string,
    initialDays = 0,
  ): Promise<LeaveBalance> {
    let balance = await this.findOne(employeeId, leaveTypeId);

    if (!balance) {
      balance = this.balanceRepository.create({
        employeeId,
        leaveTypeId,
        totalDays: initialDays,
        usedDays: 0,
        remainingDays: initialDays,
      });
      balance = await this.balanceRepository.save(balance);
    }

    return balance;
  }

  async updateBalance(
    employeeId: string,
    leaveTypeId: string,
    days: number,
    isDeduction: boolean,
  ): Promise<void> {
    const balance = await this.ensureBalance(employeeId, leaveTypeId);

    if (isDeduction) {
      balance.usedDays = Number(balance.usedDays) + days;
    } else {
      balance.usedDays = Number(balance.usedDays) - days;
    }

    balance.remainingDays = Number(balance.totalDays) - Number(balance.usedDays);
    await this.balanceRepository.save(balance);
  }

  async hasSufficientBalance(
    employeeId: string,
    leaveTypeId: string,
    days: number,
  ): Promise<boolean> {
    const balance = await this.findOne(employeeId, leaveTypeId);
    if (!balance) return false;
    return Number(balance.remainingDays) >= days;
  }
}
