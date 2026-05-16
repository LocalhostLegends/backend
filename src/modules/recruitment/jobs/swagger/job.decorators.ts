import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

import { Job } from '@database/entities/job.entity';

export const ApiJobsTags = () => ApiTags('Jobs');

export const ApiCreateJob = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create a new job vacancy' }),
    ApiResponse({ status: HttpStatus.CREATED, type: Job }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiGetJobs = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all job vacancies for the company' }),
    ApiResponse({ status: HttpStatus.OK, type: [Job] }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiGetJob = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get job vacancy by ID' }),
    ApiParam({ name: 'id', description: 'Job vacancy ID' }),
    ApiResponse({ status: HttpStatus.OK, type: Job }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job vacancy not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiUpdateJob = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update job vacancy' }),
    ApiParam({ name: 'id', description: 'Job vacancy ID' }),
    ApiResponse({ status: HttpStatus.OK, type: Job }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job vacancy not found' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiDeleteJob = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Remove job vacancy' }),
    ApiParam({ name: 'id', description: 'Job vacancy ID' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Job vacancy deleted successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job vacancy not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};
