import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';
import { DocumentCategory } from '@common/enums/document-category.enum';

export class UploadDocumentDto {
  @ApiProperty({ example: 'Passport 2024' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: DocumentCategory, example: DocumentCategory.IDENTITY })
  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: {
    expiryDate?: string;
    issueDate?: string;
    documentNumber?: string;
    notes?: string;
  };
}
