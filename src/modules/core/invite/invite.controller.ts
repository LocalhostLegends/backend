import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { Request } from 'express';

import { UserRole } from '@common/enums/user-role.enum';
import type { AuthorizedUser } from '@/modules/core/users/users.types';
import { transformToDto } from '@/common/utils/dto.utils';
import { UserRolesGuard } from '@modules/core/users/guards/user-roles.guard';
import { RequireUserRoles } from '@modules/core/users/decorators/require-user-roles.decorator';

import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { ResendInviteDto } from './dto/resend-invite.dto';
import { ValidateInviteDto } from './dto/validate-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { InviteResponseDto } from './dto/invite-response.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('invites')
export class InviteController {
  constructor(private readonly _inviteService: InviteService) {}

  @Post()
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR)
  @swagger.ApiCreateInvite()
  async createInvite(
    @Body() dto: CreateInviteDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<InviteResponseDto> {
    return transformToDto(
      InviteResponseDto,
      await this._inviteService.createInvite(dto, currentUser),
    );
  }

  @Get('validate')
  @swagger.ApiValidateInvite()
  async validateInvite(@Query() query: ValidateInviteDto): Promise<InviteResponseDto> {
    return transformToDto(InviteResponseDto, await this._inviteService.validateInvite(query.token));
  }

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @swagger.ApiAcceptInvite()
  async acceptInvite(@Body() body: AcceptInviteDto, @Req() req: Request): Promise<void> {
    await this._inviteService.acceptInvite(
      body.token,
      body.password,
      body.firstName,
      body.lastName,
      req.ip,
    );
  }

  @Post('resend')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR)
  @swagger.ApiResendInvite()
  async resendInvite(
    @Body() dto: ResendInviteDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<InviteResponseDto> {
    return transformToDto(
      InviteResponseDto,
      await this._inviteService.resendInvite(dto.inviteId, currentUser),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @swagger.ApiCancelInvite()
  async cancelInvite(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this._inviteService.cancelInvite(id, currentUser);
  }

  @Get('company')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @swagger.ApiGetCompanyInvites()
  async getCompanyInvites(
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<InviteResponseDto[]> {
    return transformToDto(
      InviteResponseDto,
      await this._inviteService.getCompanyInvites(currentUser),
    );
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @swagger.ApiGetPendingInvites()
  async getPendingInvites(
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<InviteResponseDto[]> {
    return transformToDto(
      InviteResponseDto,
      await this._inviteService.getPendingInvites(currentUser),
    );
  }
}
