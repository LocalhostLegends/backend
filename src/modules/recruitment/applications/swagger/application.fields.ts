import { SwaggerFieldsMap } from '@common/types/common.types';
import { UUID_EXAMPLE } from '@common/constants/common.constants';
import { ApplicationStage } from '@common/enums/application-stage.enum';

export const ApplicationFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Job application ID',
  },
  jobId: {
    example: UUID_EXAMPLE,
    description: 'ID of the job being applied for',
  },
  candidateId: {
    example: UUID_EXAMPLE,
    description: 'ID of the candidate applying',
  },
  stage: {
    enum: ApplicationStage,
    example: ApplicationStage.SCREENING,
    description: 'Current stage of the application',
  },
  order: {
    example: 0,
    description: 'Order in the Kanban board column',
  },
} as const satisfies SwaggerFieldsMap;
