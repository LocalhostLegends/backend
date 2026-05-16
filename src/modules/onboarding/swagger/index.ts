import {
  ApiOnboardingTags,
  ApiCreateTemplate,
  ApiUpdateTemplate,
  ApiGetTemplates,
  ApiStartOnboarding,
  ApiHireCandidate,
  ApiGetInstances,
  ApiGetInstance,
} from './onboarding.decorators';
import { OnboardingFields } from './onboarding.fields';

export const swagger = {
  ApiTags: ApiOnboardingTags,
  ApiCreateTemplate: ApiCreateTemplate,
  ApiUpdateTemplate: ApiUpdateTemplate,
  ApiGetTemplates: ApiGetTemplates,
  ApiStartOnboarding: ApiStartOnboarding,
  ApiHireCandidate: ApiHireCandidate,
  ApiGetInstances: ApiGetInstances,
  ApiGetInstance: ApiGetInstance,
};

export { OnboardingFields };
