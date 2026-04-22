import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import {
  IsDepartmentDescription,
  IsDepartmentName,
} from '@modules/organization/departments/decorators/department-fields.decorators';
import { DepartmentFields } from '@modules/organization/departments/swagger/department.fields';

export class CreateDepartmentDto {
  @ApiProperty(DepartmentFields.name)
  @IsDepartmentName()
  name: string;

  @ApiPropertyOptional(DepartmentFields.description)
  @IsOptional()
  @IsDepartmentDescription()
  description?: string;
}
