import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  EmployeeDashboardDto,
  ManagerDashboardDto,
  HRDashboardDto,
  AdminDashboardDto,
} from '../dto/dashboard-response.dto';

export const ApiDashboardTags = () => ApiTags('Dashboard');

export const ApiGetEmployeeDashboard = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get summary for employee dashboard' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Employee dashboard summary retrieved successfully',
      type: EmployeeDashboardDto,
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiGetManagerDashboard = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get summary for manager dashboard' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Manager dashboard summary retrieved successfully',
      type: ManagerDashboardDto,
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiGetHRDashboard = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get summary for HR dashboard' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'HR dashboard summary retrieved successfully',
      type: HRDashboardDto,
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiGetAdminDashboard = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get summary for Admin dashboard' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Admin dashboard summary retrieved successfully',
      type: AdminDashboardDto,
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};
