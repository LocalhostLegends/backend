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
import { UserRolesGuard } from '@modules/core/users/guards/user-roles.guard';
import { RequireUserRoles } from '@modules/core/users/decorators/require-user-roles.decorator';

import { InviteService } from './invite.service';
import { toInviteResponse } from './invite.utils';
import { CreateInviteDto } from './dto/create-invite.dto';
import { ResendInviteDto } from './dto/resend-invite.dto';
import { ValidateInviteDto } from './dto/validate-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { InviteResponseDto } from './dto/invite-response.dto';
import { InviteFilterDto } from './dto/invite-filter.dto';

import { CurrentUser } from '../users/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('invites')
export class InviteController {
  constructor(private readonly _inviteService: InviteService) {}

  @Post()
  @UseGuards(UserRolesGuard)
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR)
  @swagger.ApiCreate()
  async createInvite(
    @Body() dto: CreateInviteDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<InviteResponseDto> {
    return toInviteResponse(await this._inviteService.createInvite(dto, currentUser));
  }

  @Public()
  @Get('validate')
  @swagger.ApiValidate()
  async validateInvite(@Query() query: ValidateInviteDto): Promise<InviteResponseDto> {
    return toInviteResponse(await this._inviteService.validateInvite(query.token));
  }

  @Public()
  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @swagger.ApiAccept()
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
  @UseGuards(UserRolesGuard)
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR)
  @swagger.ApiResend()
  async resendInvite(
    @Body() dto: ResendInviteDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<InviteResponseDto> {
    return toInviteResponse(await this._inviteService.resendInvite(dto.inviteId, currentUser));
  }

  @Delete(':id')
  @UseGuards(UserRolesGuard)
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @swagger.ApiCancel()
  async cancelInvite(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this._inviteService.cancelInvite(id, currentUser);
  }

  @Get()
  @UseGuards(UserRolesGuard)
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @swagger.ApiGetCompany()
  async getCompanyInvites(
    @Query() filters: InviteFilterDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<InviteResponseDto[]> {
    return toInviteResponse(await this._inviteService.getCompanyInvites(currentUser, filters));
  }
}
