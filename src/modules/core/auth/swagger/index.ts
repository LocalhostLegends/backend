import * as authDecorators from './auth.decorators';
import { AuthFields } from './auth.fields';

export const swagger = {
  ApiTags: authDecorators.ApiAuthTags,
  ApiRegisterCompany: authDecorators.ApiRegisterCompany,
  ApiLogin: authDecorators.ApiLogin,
  ApiRefreshToken: authDecorators.ApiRefreshToken,
  ApiLogout: authDecorators.ApiLogout,
  ApiForgotPassword: authDecorators.ApiForgotPassword,
  ApiResetPassword: authDecorators.ApiResetPassword,
};

export { AuthFields };
