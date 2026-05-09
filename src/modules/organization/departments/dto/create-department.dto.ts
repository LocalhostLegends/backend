import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import {
  IsDepartmentDescription,
  IsDepartmentName,
} from '@modules/organization/departments/decorators/department-fields.decorators';
import { DepartmentFields } from '@modules/organization/departments/swagger/department.fields';
import { CustomFieldValueType } from '@modules/custom-fields/custom-fields.types';

export class CreateDepartmentDto {
  @ApiProperty(DepartmentFields.name)
  @IsDepartmentName()
  name: string;

  @ApiPropertyOptional(DepartmentFields.description)
  @IsOptional()
  @IsDepartmentDescription()
  description?: string;

  @ApiPropertyOptional({ description: 'Custom fields', type: 'object', additionalProperties: true })
  @IsOptional()
  customFields?: Record<string, CustomFieldValueType>;
}
