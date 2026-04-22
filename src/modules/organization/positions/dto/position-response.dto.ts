import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { PositionFields } from '@modules/organization/positions/swagger/position.fields';

export class PositionResponseDto {
  @Expose() @ApiProperty(PositionFields.id) id: string;
  @Expose() @ApiProperty(PositionFields.title) title: string;
  @Expose() @ApiProperty(PositionFields.description) description: string;
}
