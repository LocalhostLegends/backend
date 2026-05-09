import { SwaggerFieldsMap } from '@common/types/common.types';
import { UUID_EXAMPLE } from '@common/constants/common.constants';
import { EntityType } from '@common/enums/entity-type.enum';
import { CustomFieldType } from '@common/enums/custom-field-type.enum';

export const CustomFieldFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Custom field definition ID',
  },
  entityType: {
    enum: EntityType,
    description: 'Entity type this field belongs to',
    example: EntityType.CANDIDATE,
  },
  key: {
    description: 'Unique key for the field (used in JSON/API)',
    example: 'years_of_experience',
  },
  label: {
    description: 'Display name for the field',
    example: 'Years of Experience',
  },
  type: {
    enum: CustomFieldType,
    description: 'Data type of the field',
    example: CustomFieldType.NUMBER,
  },
  options: {
    description: 'Options for ENUM type fields',
    example: [
      { label: 'Junior', value: 'junior' },
      { label: 'Middle', value: 'middle' },
      { label: 'Senior', value: 'senior' },
    ],
  },
  refEntityType: {
    enum: EntityType,
    description: 'Entity type for ENTITY_REF fields',
    example: EntityType.DEPARTMENT,
  },
  isRequired: {
    description: 'Whether the field is mandatory',
    example: false,
  },
  isFilterable: {
    description: 'Whether the field can be used in filters',
    example: true,
  },
} as const satisfies SwaggerFieldsMap;
