import {
  ApiCustomFieldsTags,
  ApiCreateCustomFieldDefinition,
  ApiGetCustomFieldDefinitions,
  ApiUpdateCustomFieldDefinition,
  ApiDeleteCustomFieldDefinition,
} from './custom-fields.decorators';
import { CustomFieldFields } from './custom-fields.fields';

export const swagger = {
  ApiTags: ApiCustomFieldsTags,
  ApiCreateDefinition: ApiCreateCustomFieldDefinition,
  ApiGetDefinitions: ApiGetCustomFieldDefinitions,
  ApiUpdateDefinition: ApiUpdateCustomFieldDefinition,
  ApiDeleteDefinition: ApiDeleteCustomFieldDefinition,
};

export { CustomFieldFields };
