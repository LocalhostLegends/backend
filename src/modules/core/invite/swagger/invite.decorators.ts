import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';

import { InviteResponseDto } from '../dto/invite-response.dto';
import { InviteFields } from './invite.fields';

export const ApiInviteTags = () => ApiTags('Invites');

// POST /invites - create invite
export const ApiCreateInvite = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create a new invite' }),
    ApiResponse({ status: HttpStatus.CREATED, type: InviteResponseDto }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already invited' }),
  );
};

// GET /invites/validate - validate token
export const ApiValidateInvite = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Validate invite token' }),
    ApiQuery({
      name: 'token',
      type: 'string',
      description: 'Invite token',
      example: 'abc123-def456',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Invite is valid',
      schema: { example: InviteFields.validateResponse },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Invite not found' }),
    ApiResponse({ status: HttpStatus.GONE, description: 'Invite expired or already used' }),
  );
};

// POST /invites/accept - accept invite
export const ApiAcceptInvite = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Accept invite and create user' }),
    ApiBody({ schema: { example: InviteFields.acceptBodyExample } }),
    ApiResponse({ status: HttpStatus.OK, description: 'User created successfully' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid token or password' }),
    ApiResponse({ status: HttpStatus.GONE, description: 'Invite expired' }),
  );
};

// POST /invites/resend - resend invite
export const ApiResendInvite = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Resend invite email' }),
    ApiBody({ schema: { example: { inviteId: InviteFields.id.example } } }),
    ApiResponse({ status: HttpStatus.OK, type: InviteResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Invite not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

// DELETE /invites/:id - cancel invite
export const ApiCancelInvite = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Cancel invite' }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Invite ID',
      example: InviteFields.id.example,
    }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Invite cancelled successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Invite not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

// GET /invites/company - all company invites
export const ApiGetCompanyInvites = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all company invites' }),
    ApiResponse({ status: HttpStatus.OK, type: [InviteResponseDto] }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

// GET /invites/pending - pending invites
export const ApiGetPendingInvites = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get pending invites' }),
    ApiResponse({ status: HttpStatus.OK, type: [InviteResponseDto] }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};
