import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import {
  IsPositionDescription,
  IsPositionTitle,
} from '@modules/organization/positions/decorators/position-fields.decorators';
import { PositionFields } from '@modules/organization/positions/swagger/position.fields';

export class CreatePositionDto {
  @ApiProperty(PositionFields.title)
  @IsPositionTitle()
  title: string;

  @ApiPropertyOptional(PositionFields.description)
  @IsOptional()
  @IsPositionDescription()
  description?: string;
}
