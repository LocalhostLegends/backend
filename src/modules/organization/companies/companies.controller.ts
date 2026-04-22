import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from '@modules/core/auth/guards/jwt-auth.guard';
import { UserRolesGuard } from '@modules/core/users/guards/user-roles.guard';
import { UserRoles } from '@modules/core/users/decorators/user-roles.decorator';
import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { transformToDto } from '@common/utils/app.utils';
import type { AuthorizedUser } from '@common/types/authorized-user.type';

import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CompanyResponseDto } from './dto/company-response.dto';

@ApiTags('Companies')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly _companiesService: CompaniesService) {}

  @Post()
  @UserRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, type: CompanyResponseDto })
  async create(
    @Body(ValidationPipe) createCompanyDto: CreateCompanyDto,
  ): Promise<CompanyResponseDto> {
    return transformToDto(
      CompanyResponseDto,
      await this._companiesService.create(createCompanyDto),
    );
  }

  @Get()
  @UserRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, type: [CompanyResponseDto] })
  async findAll(): Promise<CompanyResponseDto[]> {
    return transformToDto(CompanyResponseDto, await this._companiesService.findAll());
  }

  @Get('my-company')
  @UserRoles(UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get current user company' })
  @ApiResponse({ status: 200, type: CompanyResponseDto })
  async getMyCompany(@CurrentUser() currentUser: AuthorizedUser): Promise<CompanyResponseDto> {
    return transformToDto(
      CompanyResponseDto,
      await this._companiesService.findById(currentUser.companyId),
    );
  }

  @Get('stats')
  @UserRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get company statistics' })
  async getStats(@CurrentUser() currentUser: AuthorizedUser) {
    return this._companiesService.getCompanyStats(currentUser.companyId);
  }

  @Get(':id')
  @UserRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, type: CompanyResponseDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CompanyResponseDto> {
    return transformToDto(CompanyResponseDto, await this._companiesService.findById(id));
  }

  @Patch(':id')
  @UserRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({ status: 200, type: CompanyResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    return transformToDto(
      CompanyResponseDto,
      await this._companiesService.update(id, updateCompanyDto),
    );
  }

  @Delete(':id')
  @UserRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete company (soft delete)' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this._companiesService.remove(id);
  }

  @Post(':id/subscription')
  @UserRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update company subscription' })
  async updateSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return transformToDto(
      CompanyResponseDto,
      await this._companiesService.updateSubscription(
        id,
        updateSubscriptionDto.plan,
        updateSubscriptionDto.expiresAt,
      ),
    );
  }
}
