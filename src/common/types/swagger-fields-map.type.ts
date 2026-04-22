import { ApiPropertyOptions } from '@nestjs/swagger';

export type SwaggerFieldsMap = Record<string, ApiPropertyOptions & { description: string }>;
