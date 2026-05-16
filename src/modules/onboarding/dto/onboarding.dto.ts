import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OnboardingStepType } from '@common/enums/onboarding-step-type.enum';
import { OnboardingAssigneeRole } from '@common/enums/onboarding-assignee-role.enum';
import { UserRole } from '@common/enums/user-role.enum';

export class CreateTemplateStepDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: OnboardingStepType })
  @IsEnum(OnboardingStepType)
  type: OnboardingStepType;

  @ApiProperty({ enum: OnboardingAssigneeRole })
  @IsEnum(OnboardingAssigneeRole)
  assigneeRole: OnboardingAssigneeRole;

  @ApiProperty()
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  durationDays: number;
}

export class CreateOnboardingTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [CreateTemplateStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateStepDto)
  steps: CreateTemplateStepDto[];
}

export class UpdateTemplateStepDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: OnboardingStepType })
  @IsEnum(OnboardingStepType)
  @IsOptional()
  type?: OnboardingStepType;

  @ApiPropertyOptional({ enum: OnboardingAssigneeRole })
  @IsEnum(OnboardingAssigneeRole)
  @IsOptional()
  assigneeRole?: OnboardingAssigneeRole;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  durationDays?: number;
}

export class UpdateOnboardingTemplateDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [UpdateTemplateStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTemplateStepDto)
  @IsOptional()
  steps?: UpdateTemplateStepDto[];
}

export class StartOnboardingDto {
  @ApiProperty()
  @IsString()
  templateId: string;

  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  customFields?: Record<string, any>;
}

export class HireCandidateDto {
  @ApiProperty()
  @IsString()
  candidateId: string;

  @ApiProperty()
  @IsString()
  templateId: string;

  @ApiProperty()
  @IsString()
  departmentId: string;

  @ApiProperty()
  @IsString()
  positionId: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  managerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  customFields?: Record<string, any>;
}
