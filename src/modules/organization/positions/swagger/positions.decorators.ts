import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PositionResponseDto } from '../dto/position-response.dto';
import { PositionFields } from './position.fields';

export const ApiPositionTags = () => ApiTags('Positions');

// POST /positions - create
export const ApiCreatePosition = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create a new position in the current company' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Position created successfully',
      type: PositionResponseDto,
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Position with this title already exists in the current company',
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

// GET /positions - findAll
export const ApiFindAllPositions = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all positions in the current company' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of positions in the current company',
      type: [PositionResponseDto],
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

// GET /positions/:id - findOne
export const ApiFindOnePosition = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get position by ID' }),
    ApiParam({
      name: 'id',
      description: 'Position UUID',
      type: String,
      example: PositionFields.id.example,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Position found',
      type: PositionResponseDto,
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid position ID' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Position not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

// PATCH /positions/:id - update
export const ApiUpdatePosition = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update position' }),
    ApiParam({
      name: 'id',
      description: 'Position UUID',
      type: String,
      example: PositionFields.id.example,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Position updated successfully',
      type: PositionResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error or invalid position ID',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Position not found' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Position with this title already exists in the current company',
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};

// DELETE /positions/:id - remove
export const ApiRemovePosition = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Delete position' }),
    ApiParam({
      name: 'id',
      description: 'Position UUID',
      type: String,
      example: PositionFields.id.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Position deleted successfully' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid position ID' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Position not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' }),
  );
};
