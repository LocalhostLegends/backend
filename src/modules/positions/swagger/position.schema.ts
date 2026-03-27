import { ApiProperty } from '@nestjs/swagger';
import { Position } from '@database/entities/position.entity';

export class PositionResponse implements Partial<Position> {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier',
  })
  id: string;

  @ApiProperty({
    example: 'Senior Developer',
    description: 'Position title',
    maxLength: 100,
  })
  title: string;

  @ApiProperty({
    example: 'Senior software developer position',
    description: 'Position description',
    required: false,
  })
  description: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
