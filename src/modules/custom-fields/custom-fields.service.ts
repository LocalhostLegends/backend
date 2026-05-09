import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';

import { CustomFieldDefinition } from '@database/entities/custom-field-definition.entity';
import { CustomFieldValue } from '@database/entities/custom-field-value.entity';
import { Company } from '@database/entities/company.entity';
import { CustomFieldType } from '@common/enums/custom-field-type.enum';
import { EntityType } from '@common/enums/entity-type.enum';

import {
  CreateCustomFieldDefinitionDto,
  UpdateCustomFieldDefinitionDto,
} from './dto/custom-field-definition.dto';
import {
  CustomFieldsMap,
  CustomFieldValueType,
  EntityCustomFieldValue,
} from './custom-fields.types';

@Injectable()
export class CustomFieldsService {
  constructor(
    @InjectRepository(CustomFieldDefinition)
    private readonly definitionRepository: Repository<CustomFieldDefinition>,
    @InjectRepository(CustomFieldValue)
    private readonly valueRepository: Repository<CustomFieldValue>,
    private readonly dataSource: DataSource,
  ) {}

  async createDefinition(
    companyId: string,
    dto: CreateCustomFieldDefinitionDto,
  ): Promise<CustomFieldDefinition> {
    const existing = await this.definitionRepository.findOne({
      where: {
        company: { id: companyId },
        entityType: dto.entityType,
        key: dto.key,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Custom field with key "${dto.key}" already exists for ${dto.entityType}`,
      );
    }

    const definition = this.definitionRepository.create({
      ...dto,
      company: { id: companyId } as Company,
    });

    return this.definitionRepository.save(definition);
  }

  async getDefinitions(
    companyId: string,
    entityType?: EntityType,
  ): Promise<CustomFieldDefinition[]> {
    return this.definitionRepository.find({
      where: {
        company: { id: companyId },
        ...(entityType ? { entityType } : {}),
      },
      order: { label: 'ASC' },
    });
  }

  async updateDefinition(
    id: string,
    companyId: string,
    dto: UpdateCustomFieldDefinitionDto,
  ): Promise<CustomFieldDefinition> {
    const definition = await this.definitionRepository.findOne({
      where: { id, company: { id: companyId } },
    });

    if (!definition) {
      throw new NotFoundException('Custom field definition not found');
    }

    Object.assign(definition, dto);
    return this.definitionRepository.save(definition);
  }

  async deleteDefinition(id: string, companyId: string): Promise<void> {
    const definition = await this.definitionRepository.findOne({
      where: { id, company: { id: companyId } },
    });

    if (!definition) {
      throw new NotFoundException('Custom field definition not found');
    }

    await this.definitionRepository.softRemove(definition);
  }

  async setValues(
    companyId: string,
    entityType: EntityType,
    entityId: string,
    values: Record<string, CustomFieldValueType>,
  ): Promise<void> {
    const definitions = await this.definitionRepository.find({
      where: {
        company: { id: companyId },
        entityType,
        key: In(Object.keys(values)),
      },
    });

    const definitionsMap = new Map(definitions.map((d) => [d.key, d]));

    await this.dataSource.transaction(async (manager) => {
      for (const [key, value] of Object.entries(values)) {
        const definition = definitionsMap.get(key);
        if (!definition) continue;

        let existingValue = await manager.findOne(CustomFieldValue, {
          where: {
            entityType,
            entityId,
            field: { id: definition.id },
          },
        });

        if (value === null || value === undefined) {
          if (existingValue) {
            await manager.remove(existingValue);
          }
          continue;
        }

        if (!existingValue) {
          existingValue = manager.create(CustomFieldValue, {
            entityType,
            entityId,
            field: definition,
          });
        }

        this.assignValue(existingValue, definition, value);
        await manager.save(existingValue);
      }
    });
  }

  async getValues(
    companyId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<CustomFieldsMap> {
    const values = await this.valueRepository.find({
      where: {
        entityType,
        entityId,
        field: { company: { id: companyId } },
      },
      relations: ['field'],
    });

    const result: CustomFieldsMap = {};
    for (const val of values) {
      result[val.field.key] = this.extractValue(val, val.field.type);
    }
    return result;
  }

  async getValuesForMultipleEntities(
    companyId: string,
    entityType: EntityType,
    entityIds: string[],
  ): Promise<EntityCustomFieldValue[]> {
    const values = await this.valueRepository.find({
      where: {
        entityType,
        entityId: In(entityIds),
        field: { company: { id: companyId } },
      },
      relations: ['field'],
    });

    return values.map((val) => ({
      entityId: val.entityId,
      fieldKey: val.field.key,
      value: this.extractValue(val, val.field.type),
    }));
  }

  private assignValue(
    target: CustomFieldValue,
    definition: CustomFieldDefinition,
    value: CustomFieldValueType,
  ): void {
    // Reset all value columns first
    target.valueText = null;
    target.valueNumber = null;
    target.valueBool = null;
    target.valueDate = null;
    target.valueEntityId = null;
    target.valueEntityType = null;

    switch (definition.type) {
      case CustomFieldType.STRING:
      case CustomFieldType.ENUM:
        target.valueText = value !== null ? String(value) : null;
        break;
      case CustomFieldType.NUMBER:
        target.valueNumber = value !== null ? Number(value) : null;
        break;
      case CustomFieldType.BOOLEAN:
        target.valueBool = value !== null ? Boolean(value) : null;
        break;
      case CustomFieldType.DATE:
        target.valueDate = value !== null ? new Date(value as string | number | Date) : null;
        break;
      case CustomFieldType.ENTITY_REF:
        target.valueEntityId = value !== null ? String(value) : null;
        target.valueEntityType = definition.refEntityType;
        break;
      case CustomFieldType.MULTI_REF:
        target.valueText = value !== null ? JSON.stringify(value) : null;
        break;
    }
  }

  private extractValue(val: CustomFieldValue, type: CustomFieldType): CustomFieldValueType {
    switch (type) {
      case CustomFieldType.STRING:
      case CustomFieldType.ENUM:
        return val.valueText;
      case CustomFieldType.NUMBER:
        return val.valueNumber !== null ? Number(val.valueNumber) : null;
      case CustomFieldType.BOOLEAN:
        return val.valueBool;
      case CustomFieldType.DATE:
        return val.valueDate;
      case CustomFieldType.ENTITY_REF:
        return val.valueEntityId;
      case CustomFieldType.MULTI_REF:
        try {
          return JSON.parse(val.valueText || '[]') as string[];
        } catch {
          return [];
        }
      default:
        return null;
    }
  }
}
