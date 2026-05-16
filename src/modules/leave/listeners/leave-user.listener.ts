import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '@database/entities/user.entity';
import { LeaveBalancesService } from '../leave-balances.service';
import { LeaveTypesService } from '../leave-types.service';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { UserRole } from '@common/enums/user-role.enum';

@Injectable()
export class LeaveUserListener {
  private readonly logger = new Logger(LeaveUserListener.name);

  constructor(
    private readonly balancesService: LeaveBalancesService,
    private readonly typesService: LeaveTypesService,
  ) {}

  @OnEvent('user.created')
  async handleUserCreated(user: User) {
    this.logger.log(`Handling user.created for user: ${user.id}`);
    await this.initializeBalances(user);
  }

  @OnEvent('user.activated')
  async handleUserActivated(user: User) {
    this.logger.log(`Handling user.activated for user: ${user.id}`);
    await this.initializeBalances(user);
  }

  private async initializeBalances(user: User) {
    // Create a minimal AuthorizedUser
    const systemUser: AuthorizedUser = {
      id: user.id,
      email: user.email,
      companyId: user.company?.id,
      roles: [UserRole.EMPLOYEE],
      permissions: [],
      permissionsVersion: user.permissionsVersion || 1,
    };

    if (!systemUser.companyId) {
      this.logger.warn(`Cannot initialize balances for user ${user.id}: companyId is missing`);
      return;
    }

    try {
      const leaveTypes = await this.typesService.findAll(systemUser);

      for (const type of leaveTypes) {
        if (type.defaultDays > 0) {
          await this.balancesService.ensureBalance(user.id, type.id, Number(type.defaultDays));
          this.logger.debug(
            `Initialized balance for user ${user.id}, type ${type.code}: ${type.defaultDays} days`,
          );
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to initialize balances for user ${user.id}: ${message}`, stack);
    }
  }
}
