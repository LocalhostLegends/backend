import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import { type AuthorizedUser } from '@modules/core/users/users.types';
import { EntityType } from '@common/enums/entity-type.enum';
import { CustomFieldDefinition } from '@database/entities/custom-field-definition.entity';

import { CustomFieldsService } from './custom-fields.service';
import {
  CreateCustomFieldDefinitionDto,
  UpdateCustomFieldDefinitionDto,
} from './dto/custom-field-definition.dto';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('custom-fields')
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  @Post('definitions')
  @swagger.ApiCreateDefinition()
  createDefinition(
    @CurrentUser() user: AuthorizedUser,
    @Body() dto: CreateCustomFieldDefinitionDto,
  ): Promise<CustomFieldDefinition> {
    return this.customFieldsService.createDefinition(user.companyId, dto);
  }

  @Get('definitions')
  @swagger.ApiGetDefinitions()
  getDefinitions(
    @CurrentUser() user: AuthorizedUser,
    @Query('entityType') entityType?: EntityType,
  ): Promise<CustomFieldDefinition[]> {
    return this.customFieldsService.getDefinitions(user.companyId, entityType);
  }

  @Put('definitions/:id')
  @swagger.ApiUpdateDefinition()
  updateDefinition(
    @CurrentUser() user: AuthorizedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomFieldDefinitionDto,
  ): Promise<CustomFieldDefinition> {
    return this.customFieldsService.updateDefinition(id, user.companyId, dto);
  }

  @Delete('definitions/:id')
  @swagger.ApiDeleteDefinition()
  deleteDefinition(
    @CurrentUser() user: AuthorizedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.customFieldsService.deleteDefinition(id, user.companyId);
  }
}
