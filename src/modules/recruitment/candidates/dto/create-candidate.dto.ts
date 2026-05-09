import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomFieldValueType } from '@modules/custom-fields/custom-fields.types';
import { CandidateFields } from '../swagger/candidate.fields';
import { CommonFields } from '@common/swagger/common.fields';

export class CreateCandidateDto {
  @ApiProperty(CandidateFields.firstName)
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty(CandidateFields.lastName)
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty(CommonFields.email)
  @IsEmail()
  email: string;

  @ApiPropertyOptional(CommonFields.phone)
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Custom fields', type: 'object', additionalProperties: true })
  @IsOptional()
  customFields?: Record<string, CustomFieldValueType>;
}
