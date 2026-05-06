import { IsString, IsOptional, IsEnum, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '@common/enums/job-status.enum';
import { JobType } from '@common/enums/job-type.enum';

export class CreateJobDto {
  @ApiProperty({ example: 'Senior NestJS Developer' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Job description text' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Requirements text' })
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiPropertyOptional({ example: 'Benefits text' })
  @IsString()
  @IsOptional()
  benefits?: string;

  @ApiPropertyOptional({ enum: JobStatus, default: JobStatus.DRAFT })
  @IsEnum(JobStatus)
  @IsOptional()
  @Transform(
    ({ value }) =>
      (typeof value === 'string' ? value.toLowerCase().replace(/[\s-]/g, '_') : value) as string,
  )
  status?: JobStatus;

  @ApiPropertyOptional({ enum: JobType, default: JobType.FULL_TIME })
  @IsEnum(JobType)
  @IsOptional()
  @Transform(
    ({ value }) =>
      (typeof value === 'string' ? value.toLowerCase().replace(/[\s-]/g, '_') : value) as string,
  )
  type?: JobType;

  @ApiPropertyOptional({ example: 'uuid-of-department' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;
}
