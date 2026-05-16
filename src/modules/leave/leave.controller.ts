import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveBalancesService } from './leave-balances.service';
import { LeaveTypesService } from './leave-types.service';
import { LeaveAuditService } from './leave-audit.service';
import {
  CreateLeaveRequestDto,
  LeaveRequestQueryDto,
  LeaveApprovalDto,
  LeaveRejectionDto,
} from './dto/leave-request.dto';
import { CreateLeaveTypeDto, UpdateLeaveTypeDto } from './dto/leave-type.dto';
import { CurrentUser } from '../core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('leave')
export class LeaveController {
  constructor(
    private readonly requestsService: LeaveRequestsService,
    private readonly balancesService: LeaveBalancesService,
    private readonly typesService: LeaveTypesService,
    private readonly auditService: LeaveAuditService,
  ) {}

  // Leave Requests
  @Post('requests')
  @swagger.ApiCreateRequest()
  createRequest(@Body() dto: CreateLeaveRequestDto, @CurrentUser() user: AuthorizedUser) {
    return this.requestsService.create(dto, user);
  }

  @Get('requests')
  @swagger.ApiFindAllRequests()
  findAllRequests(@Query() query: LeaveRequestQueryDto, @CurrentUser() user: AuthorizedUser) {
    return this.requestsService.findAll(query, user);
  }

  @Get('requests/:id')
  @swagger.ApiFindOneRequest()
  findOneRequest(@Param('id') id: string, @CurrentUser() user: AuthorizedUser) {
    return this.requestsService.findOne(id, user);
  }

  @Post('requests/:id/submit')
  @swagger.ApiSubmitRequest()
  submitRequest(@Param('id') id: string, @CurrentUser() user: AuthorizedUser) {
    return this.requestsService.submit(id, user);
  }

  @Post('requests/:id/approve')
  @swagger.ApiApproveRequest()
  approveRequest(
    @Param('id') id: string,
    @Body() dto: LeaveApprovalDto,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this.requestsService.approve(id, dto.comment, user);
  }

  @Post('requests/:id/reject')
  @swagger.ApiRejectRequest()
  rejectRequest(
    @Param('id') id: string,
    @Body() dto: LeaveRejectionDto,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this.requestsService.reject(id, dto.comment, user);
  }

  @Post('requests/:id/cancel')
  @swagger.ApiCancelRequest()
  cancelRequest(@Param('id') id: string, @CurrentUser() user: AuthorizedUser) {
    return this.requestsService.cancel(id, user);
  }

  @Get('requests/:id/audit')
  @swagger.ApiGetAuditLogs()
  getAuditLogs(@Param('id') id: string) {
    return this.auditService.findByRequestId(id);
  }

  // Leave Balances
  @Get('balances/me')
  @swagger.ApiGetMyBalances()
  getMyBalances(@CurrentUser() user: AuthorizedUser) {
    return this.balancesService.findByEmployee(user.id, user);
  }

  @Get('employees/:id/balances')
  @swagger.ApiGetEmployeeBalances()
  getEmployeeBalances(@Param('id') employeeId: string, @CurrentUser() user: AuthorizedUser) {
    return this.balancesService.findByEmployee(employeeId, user);
  }

  // Leave Types
  @Get('types')
  @swagger.ApiFindAllTypes()
  findAllTypes(@CurrentUser() user: AuthorizedUser) {
    return this.typesService.findAll(user);
  }

  @Post('types')
  @swagger.ApiCreateType()
  createType(@Body() dto: CreateLeaveTypeDto, @CurrentUser() user: AuthorizedUser) {
    return this.typesService.create(dto, user);
  }

  @Patch('types/:id')
  @swagger.ApiUpdateType()
  updateType(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveTypeDto,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this.typesService.update(id, dto, user);
  }
}
