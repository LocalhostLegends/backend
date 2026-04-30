import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CompanyResponseDto } from '../dto/company-response.dto';

export const ApiCompanyTags = () => ApiTags('Companies');

// POST /companies - create
export const ApiCreateCompany = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create a new company' }),
    ApiResponse({ status: HttpStatus.CREATED, type: CompanyResponseDto }),
  );
};

// GET /companies - findAll
export const ApiFindAllCompanies = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all companies' }),
    ApiResponse({ status: HttpStatus.OK, type: [CompanyResponseDto] }),
  );
};

// GET /companies/my-company - getMyCompany
export const ApiGetMyCompany = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get current user company' }),
    ApiResponse({ status: HttpStatus.OK, type: CompanyResponseDto }),
  );
};

// GET /companies/stats - getStats
export const ApiGetCompanyStats = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get company statistics' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Stats retrieved successfully' }),
  );
};

// GET /companies/:id - findOne
export const ApiFindOneCompany = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get company by ID' }),
    ApiResponse({ status: HttpStatus.OK, type: CompanyResponseDto }),
  );
};

// PATCH /companies/:id - update
export const ApiUpdateCompany = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update company' }),
    ApiResponse({ status: HttpStatus.OK, type: CompanyResponseDto }),
  );
};

// DELETE /companies/:id - remove
export const ApiRemoveCompany = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Delete company (soft delete)' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Company deleted successfully' }),
  );
};

// POST /companies/:id/subscription - updateSubscription
export const ApiUpdateSubscription = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update company subscription' }),
    ApiResponse({ status: HttpStatus.OK, type: CompanyResponseDto }),
  );
};
