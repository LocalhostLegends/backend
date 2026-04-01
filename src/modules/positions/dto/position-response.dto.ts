import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PositionResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() title: string;
  @Expose() @ApiProperty() description: string;
}