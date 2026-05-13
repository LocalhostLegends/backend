import { ApiProperty } from '@nestjs/swagger';

export enum OrgNodeType {
  DEPARTMENT = 'department',
  EMPLOYEE = 'employee',
}

export class OrgChartNodeDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ enum: OrgNodeType, example: OrgNodeType.EMPLOYEE })
  entityType: OrgNodeType;

  @ApiProperty({ example: 'John Doe' })
  title: string;

  @ApiProperty({ example: 'Software Engineer', required: false })
  subtitle?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  avatar?: string | null;

  @ApiProperty({ example: 'uuid', required: false })
  parentId?: string | null;

  @ApiProperty({ type: [OrgChartNodeDto], default: [] })
  children: OrgChartNodeDto[];
}
