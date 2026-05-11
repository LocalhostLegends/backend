import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe } from '@nestjs/common';

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';

import { OnboardingService } from './onboarding.service';
import {
  CreateOnboardingTemplateDto,
  StartOnboardingDto,
  HireCandidateDto,
  UpdateOnboardingTemplateDto,
} from './dto/onboarding.dto';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly _onboardingService: OnboardingService) {}

  @Post('hire')
  @swagger.ApiHireCandidate()
  hireCandidate(@Body() dto: HireCandidateDto, @CurrentUser() user: AuthorizedUser) {
    return this._onboardingService.hireCandidate(dto, user);
  }

  @Post('templates')
  @swagger.ApiCreateTemplate()
  createTemplate(@Body() dto: CreateOnboardingTemplateDto, @CurrentUser() user: AuthorizedUser) {
    return this._onboardingService.createTemplate(dto, user);
  }

  @Patch('templates/:id')
  @swagger.ApiUpdateTemplate()
  updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOnboardingTemplateDto,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this._onboardingService.updateTemplate(id, dto, user);
  }

  @Get('templates')
  @swagger.ApiGetTemplates()
  getTemplates(@CurrentUser() user: AuthorizedUser) {
    return this._onboardingService.getTemplates(user);
  }

  @Post('start')
  @swagger.ApiStartOnboarding()
  startOnboarding(@Body() dto: StartOnboardingDto, @CurrentUser() user: AuthorizedUser) {
    return this._onboardingService.startOnboarding(dto, user);
  }

  @Get('instances')
  @swagger.ApiGetInstances()
  getInstances(@CurrentUser() user: AuthorizedUser) {
    return this._onboardingService.getInstances(user);
  }

  @Get('instances/:id')
  @swagger.ApiGetInstance()
  getInstance(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthorizedUser) {
    return this._onboardingService.getInstance(id, user);
  }
}
