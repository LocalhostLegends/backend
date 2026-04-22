import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { DepartmentFields } from '@modules/organization/departments/swagger/department.fields';

export class DepartmentResponseDto {
  @Expose() @ApiProperty(DepartmentFields.id) id: string;
  @Expose() @ApiProperty(DepartmentFields.name) name: string;
  @Expose() @ApiProperty(DepartmentFields.description) description: string;
}
