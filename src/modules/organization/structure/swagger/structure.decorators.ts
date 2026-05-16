import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { OrgChartNodeDto } from '../dto/org-chart-node.dto';
import { StructureFields } from './structure.fields';

export const ApiStructureTags = () => ApiTags('Organization Structure');

export const ApiGetFullTree = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get full company organization tree' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Full tree retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          departments: { type: 'array', items: { $ref: '#/components/schemas/OrgChartNodeDto' } },
          employees: { type: 'array', items: { $ref: '#/components/schemas/OrgChartNodeDto' } },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiGetDepartmentTree = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get subtree for specific department' }),
    ApiParam({
      name: 'id',
      description: 'Department UUID',
      type: String,
      example: StructureFields.id.example,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Department subtree retrieved successfully',
      type: [OrgChartNodeDto],
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Department not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

export const ApiGetEmployeeContext = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get employee hierarchy context (managers and reports)' }),
    ApiParam({
      name: 'id',
      description: 'Employee UUID',
      type: String,
      example: StructureFields.id.example,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Employee context retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          managerChain: { type: 'array', items: { $ref: '#/components/schemas/OrgChartNodeDto' } },
          directReports: { type: 'array', items: { $ref: '#/components/schemas/OrgChartNodeDto' } },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};
