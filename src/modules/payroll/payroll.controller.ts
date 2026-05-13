import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { RequirePermission } from '@modules/permissions/decorators/require-permission.decorator';
import { Resource } from '@modules/permissions/decorators/resource.decorator';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { User } from '@database/entities/user.entity';
import { SalaryRevisionRequest } from '@database/entities/salary-revision-request.entity';

import { CompensationService } from './compensation.service';
import { BonusService } from './bonus.service';
import { PayrollService } from './payroll.service';
import { UpdateSalaryDto } from './dto/salary.dto';
import { CreateBonusDto, UpdateBonusStatusDto } from './dto/bonus.dto';
import { CreatePayrollPeriodDto, UpdatePayrollStatusDto } from './dto/payroll.dto';
import {
  CreateSalaryRevisionRequestDto,
  ReviewSalaryRevisionRequestDto,
} from './dto/revision-request.dto';
import { PayrollPeriodStatus } from '@common/enums/payroll-period-status.enum';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('payroll')
export class PayrollController {
  constructor(
    private readonly compensationService: CompensationService,
    private readonly bonusService: BonusService,
    private readonly payrollService: PayrollService,
  ) {}

  // Compensation
  @Get('compensation/:userId')
  @RequirePermission(PermissionAction.PAYROLL_READ_SELF)
  @Resource(User, 'userId')
  @swagger.ApiGetSalary()
  getSalary(@Param('userId') userId: string, @CurrentUser() user: AuthorizedUser) {
    return this.compensationService.getSalary(userId, user.companyId);
  }

  @Patch('compensation/:userId')
  @RequirePermission(PermissionAction.PAYROLL_MANAGE)
  @Resource(User, 'userId')
  @swagger.ApiUpdateSalary()
  updateSalary(
    @Param('userId') userId: string,
    @Body() dto: UpdateSalaryDto,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this.compensationService.updateSalary(userId, dto, user);
  }

  @Get('compensation/:userId/history')
  @RequirePermission(PermissionAction.PAYROLL_READ_SELF)
  @Resource(User, 'userId')
  @swagger.ApiGetHistory()
  getHistory(@Param('userId') userId: string, @CurrentUser() user: AuthorizedUser) {
    return this.compensationService.getHistory(userId, user.companyId);
  }

  // Bonuses
  @Post('bonuses')
  @RequirePermission(PermissionAction.PAYROLL_MANAGE)
  @Resource(User, 'userId')
  @swagger.ApiCreateBonus()
  createBonus(@Body() dto: CreateBonusDto, @CurrentUser() user: AuthorizedUser) {
    return this.bonusService.create(dto, user);
  }

  @Get('bonuses')
  @RequirePermission(PermissionAction.PAYROLL_READ)
  @swagger.ApiFindAllBonuses()
  findAllBonuses(@CurrentUser() user: AuthorizedUser, @Query('userId') userId?: string) {
    return this.bonusService.findAll(user.companyId, userId);
  }

  @Patch('bonuses/:id/status')
  @RequirePermission(PermissionAction.PAYROLL_APPROVE)
  @swagger.ApiUpdateBonusStatus()
  updateBonusStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBonusStatusDto,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this.bonusService.updateStatus(id, dto.status, user.companyId);
  }

  // Payroll Periods
  @Post('periods')
  @RequirePermission(PermissionAction.PAYROLL_MANAGE)
  @swagger.ApiCreatePeriod()
  createPeriod(@Body() dto: CreatePayrollPeriodDto, @CurrentUser() user: AuthorizedUser) {
    return this.payrollService.createPeriod(dto, user.companyId);
  }

  @Get('periods')
  @RequirePermission(PermissionAction.PAYROLL_READ)
  @swagger.ApiFindAllPeriods()
  findAllPeriods(@CurrentUser() user: AuthorizedUser) {
    return this.payrollService.findAllPeriods(user.companyId);
  }

  @Post('periods/:id/generate')
  @RequirePermission(PermissionAction.PAYROLL_MANAGE)
  @swagger.ApiGenerateRecords()
  generateRecords(@Param('id') id: string, @CurrentUser() user: AuthorizedUser) {
    return this.payrollService.generateRecords(id, user.companyId);
  }

  @Get('periods/:id/records')
  @RequirePermission(PermissionAction.PAYROLL_READ)
  @swagger.ApiGetPeriodRecords()
  getPeriodRecords(@Param('id') id: string, @CurrentUser() user: AuthorizedUser) {
    return this.payrollService.getPeriodRecords(id, user.companyId);
  }

  @Get('periods/:id')
  @RequirePermission(PermissionAction.PAYROLL_READ)
  @swagger.ApiGetPeriod()
  getPeriod(@Param('id') id: string, @CurrentUser() user: AuthorizedUser) {
    return this.payrollService.getPeriodById(id, user.companyId);
  }

  @Get('my-history')
  @RequirePermission(PermissionAction.PAYROLL_READ_SELF)
  @swagger.ApiGetMyPayrollHistory()
  getMyPayrollHistory(@CurrentUser() user: AuthorizedUser) {
    return this.payrollService.getMyPayrollHistory(user.id, user.companyId);
  }

  @Patch('periods/:id/status')
  @RequirePermission(PermissionAction.PAYROLL_MANAGE)
  @swagger.ApiUpdatePeriodStatus()
  updatePeriodStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePayrollStatusDto,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this.payrollService.updatePeriodStatus(
      id,
      user.companyId,
      dto.status as PayrollPeriodStatus,
      user,
    );
  }

  // Salary Revision Requests
  @Post('revisions/requests')
  @RequirePermission(PermissionAction.SALARY_REVISION_CREATE)
  @swagger.ApiCreateRevisionRequest()
  createRevisionRequest(
    @Body() dto: CreateSalaryRevisionRequestDto,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this.compensationService.createRequest(dto, user);
  }

  @Get('revisions/requests/my')
  @RequirePermission(PermissionAction.SALARY_REVISION_READ_SELF)
  @swagger.ApiGetMyRevisionRequests()
  getMyRevisionRequests(@CurrentUser() user: AuthorizedUser) {
    return this.compensationService.getMyRequests(user.id, user.companyId);
  }

  @Get('revisions/requests')
  @RequirePermission(PermissionAction.SALARY_REVISION_MANAGE)
  @swagger.ApiFindAllRevisionRequests()
  findAllRevisionRequests(@CurrentUser() user: AuthorizedUser) {
    return this.compensationService.findAllRequests(user);
  }

  @Patch('revisions/requests/:id/review')
  @RequirePermission(PermissionAction.SALARY_REVISION_MANAGE)
  @Resource(SalaryRevisionRequest, 'id', ['user'])
  @swagger.ApiReviewRevisionRequest()
  reviewRevisionRequest(
    @Param('id') id: string,
    @Body() dto: ReviewSalaryRevisionRequestDto,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this.compensationService.reviewRequest(id, dto, user);
  }
}
