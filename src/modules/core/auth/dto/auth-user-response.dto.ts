import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@common/enums/user-role.enum';
import { UserFields } from '@modules/core/users/swagger/user.fields';
import { CommonFields } from '@common/swagger/common.fields';

export class AuthUserResponseDto {
  @ApiProperty(UserFields.id)
  id: string;

  @ApiProperty(CommonFields.email)
  email: string;

  @ApiProperty(UserFields.firstName)
  firstName: string;

  @ApiProperty(UserFields.lastName)
  lastName: string;

  @ApiProperty({ ...UserFields.roles, isArray: true, type: String })
  roles: UserRole[];

  @ApiProperty({ description: 'User permissions', isArray: true, type: String })
  permissions: string[];

  @ApiProperty({ description: 'Company ID', format: 'uuid' })
  companyId: string;
}
