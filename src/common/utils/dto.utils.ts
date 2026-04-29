import { plainToInstance, ClassConstructor } from 'class-transformer';

export function transformToDto<T, V>(dto: ClassConstructor<T>, data: V[]): T[];
export function transformToDto<T, V>(dto: ClassConstructor<T>, data: V): T;

export function transformToDto<T, V>(dto: ClassConstructor<T>, data: V | V[]): T | T[] {
  return plainToInstance(dto, data, { excludeExtraneousValues: true });
}
