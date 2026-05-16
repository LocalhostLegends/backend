import {
  ApiAuthTags,
  ApiRegisterCompany,
  ApiLogin,
  ApiRefreshToken,
  ApiLogout,
  ApiForgotPassword,
  ApiResetPassword,
} from './auth.decorators';
import { AuthFields } from './auth.fields';

export const swagger = {
  ApiTags: ApiAuthTags,
  ApiRegisterCompany: ApiRegisterCompany,
  ApiLogin: ApiLogin,
  ApiRefreshToken: ApiRefreshToken,
  ApiLogout: ApiLogout,
  ApiForgotPassword: ApiForgotPassword,
  ApiResetPassword: ApiResetPassword,
};

export { AuthFields };
