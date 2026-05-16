import { IsString, IsNotEmpty, IsUrl, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskReferenceType } from '@common/enums/task-reference-type.enum';

export class CreateTaskReferenceDto {
  @ApiProperty({ enum: TaskReferenceType })
  @IsEnum(TaskReferenceType)
  type: TaskReferenceType;

  @ApiProperty({ example: 'GitHub PR #1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'https://github.com/org/repo/pull/1' })
  @IsUrl()
  url: string;
}
