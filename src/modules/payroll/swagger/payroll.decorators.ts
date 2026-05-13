import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PayrollFields } from './payroll.fields';

export const ApiPayrollTags = () => ApiTags('Payroll');

// Compensation
export const ApiGetSalary = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get employee compensation' }),
    ApiParam({
      name: 'userId',
      description: 'User UUID',
      type: String,
      example: PayrollFields.userId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Salary details retrieved' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiUpdateSalary = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update employee compensation' }),
    ApiParam({
      name: 'userId',
      description: 'User UUID',
      type: String,
      example: PayrollFields.userId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Salary updated' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiGetHistory = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get employee compensation history' }),
    ApiParam({
      name: 'userId',
      description: 'User UUID',
      type: String,
      example: PayrollFields.userId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'History retrieved' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

// Bonuses
export const ApiCreateBonus = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Award a bonus' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Bonus awarded' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiFindAllBonuses = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'List all bonuses' }),
    ApiQuery({
      name: 'userId',
      required: false,
      description: 'Filter by User UUID',
      example: PayrollFields.userId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Bonuses retrieved' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiUpdateBonusStatus = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update bonus status' }),
    ApiParam({
      name: 'id',
      description: 'Bonus UUID',
      type: String,
      example: PayrollFields.bonusId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Bonus status updated' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

// Payroll Periods
export const ApiCreatePeriod = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create a new payroll period' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Period created' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiFindAllPeriods = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'List all payroll periods' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Periods retrieved' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiGenerateRecords = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Generate payroll records for a period' }),
    ApiParam({
      name: 'id',
      description: 'Period UUID',
      type: String,
      example: PayrollFields.periodId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Records generated' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiGetPeriodRecords = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get payroll records for a period' }),
    ApiParam({
      name: 'id',
      description: 'Period UUID',
      type: String,
      example: PayrollFields.periodId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Records retrieved' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiGetPeriod = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get payroll period details' }),
    ApiParam({
      name: 'id',
      description: 'Period UUID',
      type: String,
      example: PayrollFields.periodId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Period details retrieved' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiGetMyPayrollHistory = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get my payroll history' }),
    ApiResponse({ status: HttpStatus.OK, description: 'My payroll history retrieved' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiUpdatePeriodStatus = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update payroll period status' }),
    ApiParam({
      name: 'id',
      description: 'Period UUID',
      type: String,
      example: PayrollFields.periodId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Period status updated' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

// Salary Revision Requests
export const ApiCreateRevisionRequest = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Submit a salary revision request' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Revision request submitted' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiGetMyRevisionRequests = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get my salary revision requests' }),
    ApiResponse({ status: HttpStatus.OK, description: 'My revision requests retrieved' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiFindAllRevisionRequests = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'List salary revision requests' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Revision requests retrieved' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiReviewRevisionRequest = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Review (Approve/Reject) a salary revision request' }),
    ApiParam({
      name: 'id',
      description: 'Revision Request UUID',
      type: String,
      example: PayrollFields.revisionId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Revision request reviewed' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};
