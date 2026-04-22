import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { IsPassword } from '@common/decorators/common-fields.decorators';
import { CommonFields } from '@common/swagger/common.fields';
import { InviteFields } from '@modules/core/invite/swagger/invite.fields';
import {
  IsUserFirstName,
  IsUserLastName,
} from '@modules/core/users/decorators/user-fields.decorators';
import { UserFields } from '@modules/core/users/swagger/user.fields';

export class AcceptInviteDto {
  @ApiProperty(InviteFields.token)
  @IsUUID()
  token: string;

  @ApiProperty(CommonFields.password)
  @IsPassword()
  password: string;

  @ApiPropertyOptional(UserFields.firstName)
  @IsOptional()
  @IsUserFirstName()
  firstName?: string;

  @ApiPropertyOptional(UserFields.lastName)
  @IsOptional()
  @IsUserLastName()
  lastName?: string;
}
