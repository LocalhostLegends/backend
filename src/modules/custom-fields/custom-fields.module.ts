import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomFieldDefinition } from '@database/entities/custom-field-definition.entity';
import { CustomFieldValue } from '@database/entities/custom-field-value.entity';

import { CustomFieldsService } from './custom-fields.service';
import { CustomFieldsController } from './custom-fields.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomFieldDefinition, CustomFieldValue])],
  controllers: [CustomFieldsController],
  providers: [CustomFieldsService],
  exports: [CustomFieldsService],
})
export class CustomFieldsModule {}
