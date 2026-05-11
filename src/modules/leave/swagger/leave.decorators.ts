import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { LeaveStatus } from '@common/enums/leave-status.enum';
import { LeaveFields } from './leave.fields';

export const ApiLeaveTags = () => ApiTags('Leave Management');

export const ApiCreateLeaveRequest = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create a new leave request' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Leave request created successfully' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiFindAllLeaveRequests = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all leave requests' }),
    ApiQuery({ name: 'status', enum: LeaveStatus, required: false }),
    ApiQuery({
      name: 'employeeId',
      type: String,
      required: false,
      example: LeaveFields.employeeId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'List of leave requests' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiFindOneLeaveRequest = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get a leave request by ID' }),
    ApiParam({
      name: 'id',
      description: LeaveFields.requestId.description,
      example: LeaveFields.requestId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Leave request found' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Leave request not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiSubmitLeaveRequest = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Submit a leave request for approval' }),
    ApiParam({
      name: 'id',
      description: LeaveFields.requestId.description,
      example: LeaveFields.requestId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Leave request submitted successfully' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Only draft requests can be submitted',
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiApproveLeaveRequest = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Approve a leave request' }),
    ApiParam({
      name: 'id',
      description: LeaveFields.requestId.description,
      example: LeaveFields.requestId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Leave request approved' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Only pending requests can be approved',
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiRejectLeaveRequest = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Reject a leave request' }),
    ApiParam({
      name: 'id',
      description: LeaveFields.requestId.description,
      example: LeaveFields.requestId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Leave request rejected' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Only pending requests can be rejected',
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiCancelLeaveRequest = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Cancel a leave request' }),
    ApiParam({
      name: 'id',
      description: LeaveFields.requestId.description,
      example: LeaveFields.requestId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Leave request cancelled' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Request is already rejected or cancelled',
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiGetLeaveAuditLogs = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get audit logs for a leave request' }),
    ApiParam({
      name: 'id',
      description: LeaveFields.requestId.description,
      example: LeaveFields.requestId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Audit logs' }),
  );
};

export const ApiGetMyLeaveBalances = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get current user leave balances' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Balances' }),
  );
};

export const ApiGetEmployeeLeaveBalances = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get employee leave balances' }),
    ApiParam({
      name: 'id',
      description: LeaveFields.employeeId.description,
      example: LeaveFields.employeeId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Balances' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiFindAllLeaveTypes = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all leave types' }),
    ApiResponse({ status: HttpStatus.OK, description: 'List of leave types' }),
  );
};

export const ApiCreateLeaveType = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create a new leave type' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Leave type created successfully' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Leave type with this code already exists',
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiUpdateLeaveType = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update a leave type' }),
    ApiParam({
      name: 'id',
      description: LeaveFields.typeId.description,
      example: LeaveFields.typeId.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Leave type updated successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Leave type not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};
