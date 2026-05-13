import { ApiProperty } from '@nestjs/swagger';
import { DocumentCategory } from '@common/enums/document-category.enum';
import { DocumentStatus } from '@common/enums/document-status.enum';

export class UserDocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty({ enum: DocumentCategory })
  category: DocumentCategory;

  @ApiProperty({ enum: DocumentStatus })
  status: DocumentStatus;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty({ required: false })
  url?: string;

  @ApiProperty({ required: false })
  metadata?: {
    expiryDate?: string;
    issueDate?: string;
    documentNumber?: string;
    notes?: string;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
