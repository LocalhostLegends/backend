import { ApiProperty } from '@nestjs/swagger';
import { Department } from '@database/entities/department.entity';

export class DepartmentResponse implements Partial<Department> {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Unique identifier' })
  id: string;

  @ApiProperty({ example: 'IT Department', description: 'Department name', maxLength: 100 })
  name: string;

  @ApiProperty({ example: 'Information Technology department', description: 'Department description', required: false })
  description: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' })
  updatedAt: Date;
}