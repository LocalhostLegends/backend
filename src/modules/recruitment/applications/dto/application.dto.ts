import { IsUUID, IsEnum, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStage } from '@common/enums/application-stage.enum';

export class CreateApplicationDto {
  @ApiProperty({ example: 'uuid-of-job' })
  @IsUUID()
  jobId: string;

  @ApiProperty({ example: 'uuid-of-candidate' })
  @IsUUID()
  candidateId: string;
}

export class UpdateApplicationStageDto {
  @ApiProperty({ enum: ApplicationStage })
  @IsEnum(ApplicationStage)
  stage: ApplicationStage;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @IsOptional()
  order?: number;
}
