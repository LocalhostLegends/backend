import { ApiProperty } from '@nestjs/swagger';
import { UserDirectoryResponseDto } from './user-directory-response.dto';

class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  totalItems: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;
}

export class UserDirectoryPaginatedResponseDto {
  @ApiProperty({ type: [UserDirectoryResponseDto] })
  items: UserDirectoryResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
