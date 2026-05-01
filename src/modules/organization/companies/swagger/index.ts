import * as companyDecorators from './company.decorators';
import { CompanyFields } from './company.fields';

export const swagger = {
  ApiTags: companyDecorators.ApiCompanyTags,
  ApiCreate: companyDecorators.ApiCreateCompany,
  ApiFindAll: companyDecorators.ApiFindAllCompanies,
  ApiGetMyCompany: companyDecorators.ApiGetMyCompany,
  ApiGetStats: companyDecorators.ApiGetCompanyStats,
  ApiFindOne: companyDecorators.ApiFindOneCompany,
  ApiUpdate: companyDecorators.ApiUpdateCompany,
  ApiRemove: companyDecorators.ApiRemoveCompany,
  ApiUpdateSubscription: companyDecorators.ApiUpdateSubscription,
};

export { CompanyFields };
