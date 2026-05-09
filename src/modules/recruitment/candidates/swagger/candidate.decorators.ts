import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

import { Candidate } from '@database/entities/candidate.entity';

export const ApiCandidatesTags = () => ApiTags('Candidates');

export const ApiCreateCandidate = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create a new candidate' }),
    ApiResponse({ status: HttpStatus.CREATED, type: Candidate }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiGetCandidates = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all candidates for the company' }),
    ApiResponse({ status: HttpStatus.OK, type: [Candidate] }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiGetCandidate = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get candidate by id' }),
    ApiParam({ name: 'id', description: 'Candidate ID' }),
    ApiResponse({ status: HttpStatus.OK, type: Candidate }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Candidate not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiUpdateCandidate = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update candidate' }),
    ApiParam({ name: 'id', description: 'Candidate ID' }),
    ApiResponse({ status: HttpStatus.OK, type: Candidate }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Candidate not found' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiDeleteCandidate = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Delete candidate' }),
    ApiParam({ name: 'id', description: 'Candidate ID' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Candidate deleted successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Candidate not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};
