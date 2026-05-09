import {
  ApiCompanyTags,
  ApiCreateCompany,
  ApiFindAllCompanies,
  ApiGetCompanyStats,
  ApiFindOneCompany,
  ApiUpdateCompany,
  ApiRemoveCompany,
  ApiUpdateSubscription,
} from './company.decorators';
import { CompanyFields } from './company.fields';

export const swagger = {
  ApiTags: ApiCompanyTags,
  ApiCreate: ApiCreateCompany,
  ApiFindAll: ApiFindAllCompanies,
  ApiGetStats: ApiGetCompanyStats,
  ApiFindOne: ApiFindOneCompany,
  ApiUpdate: ApiUpdateCompany,
  ApiRemove: ApiRemoveCompany,
  ApiUpdateSubscription: ApiUpdateSubscription,
};

export { CompanyFields };
