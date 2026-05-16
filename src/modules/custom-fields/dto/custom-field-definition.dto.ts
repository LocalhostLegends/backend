import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CustomFieldType } from '@common/enums/custom-field-type.enum';
import { EntityType } from '@common/enums/entity-type.enum';
import { CustomFieldOption } from '../custom-fields.types';
import { CustomFieldFields } from '../swagger/custom-fields.fields';

export class CustomFieldOptionDto implements CustomFieldOption {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateCustomFieldDefinitionDto {
  @ApiProperty(CustomFieldFields.entityType)
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty(CustomFieldFields.key)
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty(CustomFieldFields.label)
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty(CustomFieldFields.type)
  @IsEnum(CustomFieldType)
  type: CustomFieldType;

  @ApiPropertyOptional({ ...CustomFieldFields.options, type: [CustomFieldOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldOptionDto)
  options?: CustomFieldOptionDto[];

  @ApiPropertyOptional(CustomFieldFields.refEntityType)
  @IsOptional()
  @IsEnum(EntityType)
  refEntityType?: EntityType;

  @ApiPropertyOptional(CustomFieldFields.isRequired)
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional(CustomFieldFields.isFilterable)
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;
}

export class UpdateCustomFieldDefinitionDto {
  @ApiPropertyOptional(CustomFieldFields.label)
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ ...CustomFieldFields.options, type: [CustomFieldOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldOptionDto)
  options?: CustomFieldOptionDto[];

  @ApiPropertyOptional(CustomFieldFields.isRequired)
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional(CustomFieldFields.isFilterable)
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;
}
