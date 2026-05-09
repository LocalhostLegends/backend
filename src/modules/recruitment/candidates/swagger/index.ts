import {
  ApiCandidatesTags,
  ApiCreateCandidate,
  ApiGetCandidates,
  ApiGetCandidate,
  ApiUpdateCandidate,
  ApiDeleteCandidate,
} from './candidate.decorators';
import { CandidateFields } from './candidate.fields';

export const swagger = {
  ApiTags: ApiCandidatesTags,
  ApiCreate: ApiCreateCandidate,
  ApiGetAll: ApiGetCandidates,
  ApiGetOne: ApiGetCandidate,
  ApiUpdate: ApiUpdateCandidate,
  ApiDelete: ApiDeleteCandidate,
};

export { CandidateFields };
