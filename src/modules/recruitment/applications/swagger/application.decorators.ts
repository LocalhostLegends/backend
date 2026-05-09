import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

import { JobApplication } from '@database/entities/job-application.entity';

export const ApiApplicationsTags = () => ApiTags('Job Applications');

export const ApiCreateApplication = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create a new job application' }),
    ApiResponse({ status: HttpStatus.CREATED, type: JobApplication }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiGetApplicationsByJob = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all applications for a specific job (Kanban board data)' }),
    ApiParam({ name: 'jobId', description: 'Job vacancy ID' }),
    ApiResponse({ status: HttpStatus.OK, type: [JobApplication] }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiUpdateApplicationStage = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update application stage (Kanban move)' }),
    ApiParam({ name: 'id', description: 'Application ID' }),
    ApiResponse({ status: HttpStatus.OK, type: JobApplication }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Application not found' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid stage' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiDeleteApplication = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Remove application' }),
    ApiParam({ name: 'id', description: 'Application ID' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Application deleted successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Application not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};
