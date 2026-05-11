import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { OnboardingTemplate } from '@database/entities/onboarding-template.entity';
import { OnboardingInstance } from '@database/entities/onboarding-instance.entity';

export const ApiOnboardingTags = () => ApiTags('Onboarding');

export const ApiCreateTemplate = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create onboarding template' }),
    ApiResponse({ status: HttpStatus.CREATED, type: OnboardingTemplate }),
  );
};

export const ApiUpdateTemplate = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update onboarding template' }),
    ApiResponse({ status: HttpStatus.OK, type: OnboardingTemplate }),
  );
};

export const ApiGetTemplates = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all onboarding templates' }),
    ApiResponse({ status: HttpStatus.OK, type: [OnboardingTemplate] }),
  );
};

export const ApiStartOnboarding = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Start onboarding process for employee' }),
    ApiResponse({ status: HttpStatus.CREATED, type: OnboardingInstance }),
  );
};

export const ApiHireCandidate = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Hire candidate: create user, invite and start onboarding' }),
    ApiResponse({ status: HttpStatus.CREATED, type: OnboardingInstance }),
  );
};

export const ApiGetInstances = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all onboarding instances' }),
    ApiResponse({ status: HttpStatus.OK, type: [OnboardingInstance] }),
  );
};

export const ApiGetInstance = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get onboarding instance detail' }),
    ApiResponse({ status: HttpStatus.OK, type: OnboardingInstance }),
  );
};
