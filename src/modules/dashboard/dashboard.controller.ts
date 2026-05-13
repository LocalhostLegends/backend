import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { UserRole } from '@common/enums/user-role.enum';
import { DashboardService } from './dashboard.service';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @swagger.ApiGetEmployee() // Default to employee, or we could have multiple
  async getSummary(@CurrentUser() user: AuthorizedUser) {
    if (user.roles.includes(UserRole.SUPER_ADMIN) || user.roles.includes(UserRole.ADMIN)) {
      return this.dashboardService.getAdminSummary(user);
    }
    if (user.roles.includes(UserRole.HR)) {
      return this.dashboardService.getHRSummary(user);
    }
    if (user.roles.includes(UserRole.MANAGER)) {
      return this.dashboardService.getManagerSummary(user);
    }
    return this.dashboardService.getEmployeeSummary(user);
  }

  @Get('employee')
  @swagger.ApiGetEmployee()
  async getEmployeeSummary(@CurrentUser() user: AuthorizedUser) {
    return this.dashboardService.getEmployeeSummary(user);
  }

  @Get('manager')
  @swagger.ApiGetManager()
  async getManagerSummary(@CurrentUser() user: AuthorizedUser) {
    return this.dashboardService.getManagerSummary(user);
  }

  @Get('hr')
  @swagger.ApiGetHR()
  async getHRSummary(@CurrentUser() user: AuthorizedUser) {
    return this.dashboardService.getHRSummary(user);
  }

  @Get('admin')
  @swagger.ApiGetAdmin()
  async getAdminSummary(@CurrentUser() user: AuthorizedUser) {
    return this.dashboardService.getAdminSummary(user);
  }
}
