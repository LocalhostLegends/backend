import {
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsEmail,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserRole } from '@common/enums/user-role.enum';
import { UserStatus } from '@/common/enums/user-status.enum';
import { IsBooleanQuery } from '@common/decorators/common-fields.decorators';
import {
  IsPaginationLimit,
  IsPaginationPage,
  IsPaginationSortOrder,
} from '@modules/pagination/decorators/pagination-fields.decorators';
import { SortOrder } from '@modules/pagination/enums/sort-order.enum';
import { CommonFields } from '@common/swagger/common.fields';
import { PaginationQueryFields } from '@modules/pagination/swagger/pagination-query.fields';
import { IsUserRole, IsUserStatus } from '@modules/core/users/decorators/user-fields.decorators';
import { UserFields } from '@modules/core/users/swagger/user.fields';
import { UserFilterFields } from '@modules/core/users/swagger/user-filter.fields';
import { CompanyFields } from '@modules/organization/companies/swagger/company.fields';
import { DepartmentFields } from '@modules/organization/departments/swagger/department.fields';
import { PositionFields } from '@modules/organization/positions/swagger/position.fields';

export class UserFilterDto {
  @ApiPropertyOptional(PaginationQueryFields.page)
  @IsOptional()
  @IsPaginationPage()
  page?: number = 1;

  @ApiPropertyOptional(PaginationQueryFields.limit)
  @IsOptional()
  @IsPaginationLimit()
  limit?: number = 10;

  @ApiPropertyOptional(PaginationQueryFields.sortBy)
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional(PaginationQueryFields.sortOrder)
  @IsOptional()
  @IsPaginationSortOrder()
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional(UserFilterFields.search)
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional(UserFields.roles)
  @IsOptional()
  @IsUserRole()
  role?: UserRole;

  @ApiPropertyOptional(UserFields.status)
  @IsOptional()
  @IsUserStatus()
  status?: UserStatus;

  @ApiPropertyOptional(DepartmentFields.id)
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional(PositionFields.id)
  @IsOptional()
  @IsUUID()
  positionId?: string;

  @ApiPropertyOptional(CommonFields.email)
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional(UserFilterFields.statuses)
  @IsOptional()
  @IsArray()
  @IsEnum(UserStatus, { each: true })
  statuses?: UserStatus[];

  @ApiPropertyOptional(UserFilterFields.roles)
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  @ApiPropertyOptional(UserFilterFields.createdAfter)
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional(UserFilterFields.createdBefore)
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional(UserFilterFields.pendingOnly)
  @IsOptional()
  @IsBooleanQuery()
  pendingOnly?: boolean;

  @ApiPropertyOptional(UserFilterFields.activeOnly)
  @IsOptional()
  @IsBooleanQuery()
  activeOnly?: boolean;

  @ApiPropertyOptional(UserFilterFields.blockedOnly)
  @IsOptional()
  @IsBooleanQuery()
  blockedOnly?: boolean;

  @ApiPropertyOptional(UserFilterFields.withDeleted)
  @IsOptional()
  @IsBooleanQuery()
  withDeleted?: boolean = false;

  @ApiPropertyOptional(CompanyFields.id)
  @IsOptional()
  @IsUUID()
  companyId?: string;
}
