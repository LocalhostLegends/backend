import { SetMetadata, Type } from '@nestjs/common';

export const RESOURCE_KEY = 'resource';

export interface ResourceMetadata {
  type: Type<any>;
  paramName?: string;
  field?: string;
}

export const Resource = (type: Type<any>, paramName: string = 'id') =>
  SetMetadata(RESOURCE_KEY, { type, paramName } as ResourceMetadata);
