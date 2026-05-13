import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { DocumentStatus } from '@common/enums/document-status.enum';

export class UpdateDocumentStatusDto {
  @ApiProperty({ enum: [DocumentStatus.VERIFIED, DocumentStatus.REJECTED] })
  @IsEnum([DocumentStatus.VERIFIED, DocumentStatus.REJECTED])
  status: DocumentStatus;

  @ApiPropertyOptional({ description: 'Required when status is rejected' })
  @ValidateIf((o: UpdateDocumentStatusDto) => o.status === DocumentStatus.REJECTED)
  @IsString()
  @IsNotEmpty({ message: 'Notes are required when rejecting a document' })
  notes?: string;
}
