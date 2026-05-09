import { IsUUID, IsEnum, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStage } from '@common/enums/application-stage.enum';
import { CustomFieldValueType } from '@modules/custom-fields/custom-fields.types';
import { ApplicationFields } from '../swagger/application.fields';

export class CreateApplicationDto {
  @ApiProperty(ApplicationFields.jobId)
  @IsUUID()
  jobId: string;

  @ApiProperty(ApplicationFields.candidateId)
  @IsUUID()
  candidateId: string;

  @ApiPropertyOptional({ description: 'Custom fields', type: 'object', additionalProperties: true })
  @IsOptional()
  customFields?: Record<string, CustomFieldValueType>;
}

export class UpdateApplicationStageDto {
  @ApiProperty(ApplicationFields.stage)
  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @ApiPropertyOptional(ApplicationFields.order)
  @IsInt()
  @IsOptional()
  order?: number;
}
