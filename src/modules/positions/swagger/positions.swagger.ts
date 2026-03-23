import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PositionResponse } from './position.schema';

export const SwaggerCreatePosition = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new position' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Position created successfully', type: PositionResponse }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Position with this title already exists' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }),
  );
};

export const SwaggerFindAllPositions = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get all positions' }),
    ApiResponse({ status: HttpStatus.OK, description: 'List of positions', type: [PositionResponse] }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }),
  );
};

export const SwaggerFindOnePosition = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get position by ID' }),
    ApiParam({ name: 'id', description: 'Position UUID', type: String }),
    ApiResponse({ status: HttpStatus.OK, description: 'Position found', type: PositionResponse }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Position not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }),
  );
};

export const SwaggerUpdatePosition = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update position' }),
    ApiParam({ name: 'id', description: 'Position UUID', type: String }),
    ApiResponse({ status: HttpStatus.OK, description: 'Position updated successfully', type: PositionResponse }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Position not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Position with this title already exists' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }),
  );
};

export const SwaggerDeletePosition = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete position' }),
    ApiParam({ name: 'id', description: 'Position UUID', type: String }),
    ApiResponse({ status: HttpStatus.OK, description: 'Position deleted successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Position not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied. HR role required' }),
  );
};