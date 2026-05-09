import { IsString, IsOptional, IsEnum, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '@common/enums/job-status.enum';
import { JobType } from '@common/enums/job-type.enum';
import { CustomFieldValueType } from '@modules/custom-fields/custom-fields.types';
import { JobFields } from '../swagger/job.fields';

export class CreateJobDto {
  @ApiProperty(JobFields.title)
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional(JobFields.description)
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional(JobFields.requirements)
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiPropertyOptional(JobFields.benefits)
  @IsString()
  @IsOptional()
  benefits?: string;

  @ApiPropertyOptional(JobFields.status)
  @IsEnum(JobStatus)
  @IsOptional()
  @Transform(
    ({ value }) =>
      (typeof value === 'string' ? value.toLowerCase().replace(/[\s-]/g, '_') : value) as string,
  )
  status?: JobStatus;

  @ApiPropertyOptional(JobFields.type)
  @IsEnum(JobType)
  @IsOptional()
  @Transform(
    ({ value }) =>
      (typeof value === 'string' ? value.toLowerCase().replace(/[\s-]/g, '_') : value) as string,
  )
  type?: JobType;

  @ApiPropertyOptional(JobFields.departmentId)
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Custom fields', type: 'object', additionalProperties: true })
  @IsOptional()
  customFields?: Record<string, CustomFieldValueType>;
}
