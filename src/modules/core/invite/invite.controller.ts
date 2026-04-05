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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '@/modules/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/core/auth/guards/roles.guard';
import { Roles } from '@/modules/core/auth/decorators/roles.decorator';
import { CurrentUser } from '@/modules/core/auth/decorators/current-user.decorator';
import { UserRole } from '@/database/enums';
import type { AuthorizedUser } from '@/modules/core/auth/auth.types';

import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { ResendInviteDto } from './dto/resend-invite.dto';
import { ValidateInviteDto } from './dto/validate-invite.dto';
import { InviteResponseDto } from './dto/invite-response.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Invites')
@Controller('invites')
export class InviteController {
  constructor(private readonly _inviteService: InviteService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new invite' })
  @ApiResponse({ status: HttpStatus.CREATED, type: InviteResponseDto })
  async createInvite(
    @Body() dto: CreateInviteDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<InviteResponseDto> {
    const invite = await this._inviteService.createInvite(dto, currentUser);
    return plainToInstance(InviteResponseDto, invite, {
      excludeExtraneousValues: true,
    });
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate invite token' })
  @ApiResponse({ status: HttpStatus.OK, type: InviteResponseDto })
  async validateInvite(
    @Query() query: ValidateInviteDto,
  ): Promise<InviteResponseDto> {
    const invite = await this._inviteService.validateInvite(query.token);
    return plainToInstance(InviteResponseDto, invite, {
      excludeExtraneousValues: true,
    });
  }

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept invite and create user' })
  async acceptInvite(
    @Body() body: { token: string; password: string; firstName?: string; lastName?: string },
    @Req() req: Request,
  ): Promise<{ message: string; accessToken?: string; refreshToken?: string }> {
    await this._inviteService.acceptInvite(
      body.token,
      body.password,
      body.firstName,
      body.lastName,
      req.ip,
    );

    // TODO: Generate tokens and return
    return { message: 'Account activated successfully' };
  }

  @Post('resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Resend invite email' })
  @ApiResponse({ status: HttpStatus.OK, type: InviteResponseDto })
  async resendInvite(
    @Body() dto: ResendInviteDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<InviteResponseDto> {
    const invite = await this._inviteService.resendInvite(dto.inviteId, currentUser);
    return plainToInstance(InviteResponseDto, invite, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel invite' })
  async cancelInvite(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this._inviteService.cancelInvite(id, currentUser);
  }

  @Get('company')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all company invites' })
  @ApiResponse({ status: HttpStatus.OK, type: [InviteResponseDto] })
  async getCompanyInvites(
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<InviteResponseDto[]> {
    const invites = await this._inviteService.getCompanyInvites(currentUser.companyId);
    return plainToInstance(InviteResponseDto, invites, {
      excludeExtraneousValues: true,
    });
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get pending invites' })
  @ApiResponse({ status: HttpStatus.OK, type: [InviteResponseDto] })
  async getPendingInvites(
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<InviteResponseDto[]> {
    const invites = await this._inviteService.getPendingInvites(currentUser.companyId);
    return plainToInstance(InviteResponseDto, invites, {
      excludeExtraneousValues: true,
    });
  }
}