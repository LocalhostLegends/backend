import { UUID_EXAMPLE } from '@common/constants/common.constants';
import { DocumentCategory } from '@common/enums/document-category.enum';
import { DocumentStatus } from '@common/enums/document-status.enum';

export const DocumentFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Document unique identifier',
  },
  name: {
    example: 'Passport 2024',
    description: 'Friendly name of the document',
  },
  fileName: {
    example: 'passport_v1.pdf',
    description: 'Original file name',
  },
  category: {
    enum: DocumentCategory,
    example: DocumentCategory.IDENTITY,
    description: 'Document category',
  },
  status: {
    enum: DocumentStatus,
    example: DocumentStatus.PENDING,
    description: 'Current verification status',
  },
  url: {
    example: 'https://example.com/signed-url-to-private-file',
    description: 'Temporary signed URL for downloading/viewing',
  },
  metadata: {
    example: {
      expiryDate: '2030-01-01',
      documentNumber: '1234-5678',
      notes: 'Please verify the photo quality',
    },
    description: 'Additional document metadata',
  },
} as const;
