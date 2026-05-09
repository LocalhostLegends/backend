import { SwaggerFieldsMap } from '@common/types/common.types';
import { UUID_EXAMPLE } from '@common/constants/common.constants';

export const CandidateFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Candidate ID',
  },
  firstName: {
    example: 'Alice',
    description: 'Candidate first name',
  },
  lastName: {
    example: 'Smith',
    description: 'Candidate last name',
  },
  resumeUrl: {
    example: 'https://storage.example.com/resumes/alice-smith.pdf',
    description: 'URL to the candidate resume file',
  },
} as const satisfies SwaggerFieldsMap;
