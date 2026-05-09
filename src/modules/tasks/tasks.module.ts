import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from '@database/entities/task.entity';
import { PermissionsModule } from '@modules/permissions/permissions.module';
import { CustomFieldsModule } from '@modules/custom-fields/custom-fields.module';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), PermissionsModule, CustomFieldsModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
