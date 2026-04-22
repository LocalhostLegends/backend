import { applyDecorators } from '@nestjs/common';
import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { UserRole } from '@common/enums/user-role.enum';
import { UserStatus } from '@database/enums/user-status.enum';

export const IsUserFirstName = () =>
  applyDecorators(IsNotEmpty(), IsString(), MinLength(2), MaxLength(100));

export const IsUserLastName = () =>
  applyDecorators(IsNotEmpty(), IsString(), MinLength(2), MaxLength(100));

export const IsUserRole = () => applyDecorators(IsEnum(UserRole));

export const IsUserStatus = () => applyDecorators(IsEnum(UserStatus));
