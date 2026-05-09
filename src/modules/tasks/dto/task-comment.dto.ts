import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskCommentDto {
  @ApiProperty({ example: 'This is a comment' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateTaskCommentDto {
  @ApiProperty({ example: 'Updated comment' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
