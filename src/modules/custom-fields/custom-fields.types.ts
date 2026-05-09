export type CustomFieldValueType = string | number | boolean | Date | string[] | null;

export interface CustomFieldOption {
  label: string;
  value: string;
}

export interface EntityCustomFieldValue {
  entityId: string;
  fieldKey: string;
  value: CustomFieldValueType;
}

export type CustomFieldsMap = Record<string, CustomFieldValueType>;
