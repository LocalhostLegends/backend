import { SwaggerFieldsMap } from '@common/types/common.types';
import { UUID_EXAMPLE } from '@common/constants/common.constants';
import { JobStatus } from '@common/enums/job-status.enum';
import { JobType } from '@common/enums/job-type.enum';

export const JobFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Job vacancy ID',
  },
  title: {
    example: 'Senior Fullstack Developer',
    description: 'Job title',
  },
  description: {
    example: 'We are looking for an experienced developer...',
    description: 'Detailed job description',
  },
  requirements: {
    example: '5+ years of experience with Node.js and React...',
    description: 'Job requirements',
  },
  benefits: {
    example: 'Competitive salary, remote work, health insurance...',
    description: 'Job benefits',
  },
  status: {
    enum: JobStatus,
    example: JobStatus.OPEN,
    description: 'Current job status',
  },
  type: {
    enum: JobType,
    example: JobType.FULL_TIME,
    description: 'Employment type',
  },
  departmentId: {
    example: UUID_EXAMPLE,
    description: 'Department ID this job belongs to',
  },
  candidatesCount: {
    example: 15,
    description: 'Number of candidates applied for this job',
  },
} as const satisfies SwaggerFieldsMap;
