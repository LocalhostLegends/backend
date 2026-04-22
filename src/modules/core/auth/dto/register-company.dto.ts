import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

import { IsPassword } from '@common/decorators/common-fields.decorators';
import { CommonFields } from '@common/swagger/common.fields';
import {
  IsUserFirstName,
  IsUserLastName,
} from '@modules/core/users/decorators/user-fields.decorators';
import { UserFields } from '@modules/core/users/swagger/user.fields';
import { IsCompanyName } from '@modules/organization/companies/decorators/company-fields.decorators';
import { CompanyFields } from '@modules/organization/companies/swagger/company.fields';

export class RegisterCompanyDto {
  @ApiProperty(CompanyFields.name)
  @IsCompanyName()
  companyName: string;

  @ApiProperty(UserFields.firstName)
  @IsUserFirstName()
  firstName: string;

  @ApiProperty(UserFields.lastName)
  @IsUserLastName()
  lastName: string;

  @ApiProperty(CommonFields.email)
  @IsEmail()
  email: string;

  @ApiProperty(CommonFields.password)
  @IsPassword()
  password: string;
}
