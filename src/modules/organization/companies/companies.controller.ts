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

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import { UserRolesGuard } from '@modules/core/users/guards/user-roles.guard';
import { RequireUserRoles } from '@modules/core/users/decorators/require-user-roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { transformToDto } from '@/common/utils/dto.utils';
import { USER_ROLES } from '@/common/constants/common.constants';
import type { AuthorizedUser } from '@/modules/core/users/users.types';

import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { swagger } from './swagger';

@swagger.ApiTags()
@UseGuards(UserRolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly _companiesService: CompaniesService) {}

  @Post()
  @RequireUserRoles(UserRole.ADMIN)
  @swagger.ApiCreate()
  async create(
    @Body(ValidationPipe) createCompanyDto: CreateCompanyDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<CompanyResponseDto> {
    return transformToDto(
      CompanyResponseDto,
      await this._companiesService.create(createCompanyDto, currentUser),
    );
  }

  @Get()
  @RequireUserRoles(UserRole.ADMIN)
  @swagger.ApiFindAll()
  async findAll(@CurrentUser() currentUser: AuthorizedUser): Promise<CompanyResponseDto[]> {
    return transformToDto(CompanyResponseDto, await this._companiesService.findAll(currentUser));
  }

  @Get('my-company')
  @RequireUserRoles(...USER_ROLES)
  @swagger.ApiGetMyCompany()
  async getMyCompany(@CurrentUser() currentUser: AuthorizedUser): Promise<CompanyResponseDto> {
    return transformToDto(
      CompanyResponseDto,
      await this._companiesService.findById(currentUser.companyId, currentUser),
    );
  }

  @Get('stats')
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @swagger.ApiGetStats()
  async getStats(@CurrentUser() currentUser: AuthorizedUser) {
    return this._companiesService.getCompanyStats(currentUser.companyId, currentUser);
  }

  @Get(':id')
  @RequireUserRoles(UserRole.ADMIN)
  @swagger.ApiFindOne()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<CompanyResponseDto> {
    return transformToDto(
      CompanyResponseDto,
      await this._companiesService.findById(id, currentUser),
    );
  }

  @Patch(':id')
  @RequireUserRoles(UserRole.ADMIN)
  @swagger.ApiUpdate()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<CompanyResponseDto> {
    return transformToDto(
      CompanyResponseDto,
      await this._companiesService.update(id, updateCompanyDto, currentUser),
    );
  }

  @Delete(':id')
  @RequireUserRoles(UserRole.ADMIN)
  @swagger.ApiRemove()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this._companiesService.remove(id, currentUser);
  }

  @Post(':id/subscription')
  @RequireUserRoles(UserRole.ADMIN)
  @swagger.ApiUpdateSubscription()
  async updateSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateSubscriptionDto: UpdateSubscriptionDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ) {
    return transformToDto(
      CompanyResponseDto,
      await this._companiesService.updateSubscription(
        id,
        updateSubscriptionDto.plan,
        updateSubscriptionDto.expiresAt,
        currentUser,
      ),
    );
  }
}
