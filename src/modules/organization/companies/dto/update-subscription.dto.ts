import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { IsDateQuery } from '@common/decorators/common-fields.decorators';
import { CompanyFields } from '@modules/organization/companies/swagger/company.fields';

export class UpdateSubscriptionDto {
  @ApiProperty(CompanyFields.subscriptionPlan)
  @IsNotEmpty()
  @IsString()
  plan: string;

  @ApiProperty(CompanyFields.subscriptionExpiresAt)
  @IsDateQuery()
  expiresAt: Date;
}
