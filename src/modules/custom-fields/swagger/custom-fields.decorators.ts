import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { EntityType } from '@common/enums/entity-type.enum';
import { CustomFieldDefinition } from '@database/entities/custom-field-definition.entity';

export const ApiCustomFieldsTags = () => ApiTags('Custom Fields');

export const ApiCreateCustomFieldDefinition = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create a custom field definition' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      type: CustomFieldDefinition,
      description: 'Custom field definition created successfully',
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiGetCustomFieldDefinitions = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all custom field definitions for a company' }),
    ApiQuery({
      name: 'entityType',
      enum: EntityType,
      required: false,
      description: 'Filter definitions by entity type',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      type: [CustomFieldDefinition],
      description: 'List of custom field definitions',
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiUpdateCustomFieldDefinition = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update a custom field definition' }),
    ApiParam({ name: 'id', description: 'Custom field definition ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      type: CustomFieldDefinition,
      description: 'Custom field definition updated successfully',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Custom field definition not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiDeleteCustomFieldDefinition = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Delete a custom field definition' }),
    ApiParam({ name: 'id', description: 'Custom field definition ID' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Custom field definition deleted successfully',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Custom field definition not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};
