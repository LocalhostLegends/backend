import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OnboardingInstanceStep } from '@database/entities/onboarding-instance-step.entity';
import { OnboardingInstance } from '@database/entities/onboarding-instance.entity';
import { OnboardingStatus } from '@common/enums/onboarding-status.enum';
import { TaskStage } from '@common/enums/task-stage.enum';
import { ParticipantStatus } from '@common/enums/participant-status.enum';

@Injectable()
export class OnboardingListener {
  private readonly logger = new Logger(OnboardingListener.name);

  constructor(
    @InjectRepository(OnboardingInstanceStep)
    private readonly _instanceStepRepo: Repository<OnboardingInstanceStep>,
    @InjectRepository(OnboardingInstance)
    private readonly _instanceRepo: Repository<OnboardingInstance>,
  ) {}

  @OnEvent('task.stage_changed')
  async handleTaskStageChanged(payload: {
    taskId: string;
    newStage: TaskStage;
    companyId: string;
  }) {
    const { taskId, newStage } = payload;

    const step = await this._instanceStepRepo.findOne({
      where: { linkedTaskId: taskId },
      relations: ['instance'],
    });

    if (!step) return;

    if (newStage === TaskStage.DONE) {
      await this._completeStep(step);
      this.logger.log(
        `Onboarding step ${step.id} marked as COMPLETED because task ${taskId} is DONE`,
      );
    }
  }

  @OnEvent('calendar.event_responded')
  async handleCalendarEventResponded(payload: {
    eventId: string;
    status: ParticipantStatus;
    userId: string;
  }) {
    const { eventId, status } = payload;

    const step = await this._instanceStepRepo.findOne({
      where: { linkedCalendarEventId: eventId },
      relations: ['instance'],
    });

    if (!step) return;

    if (status === ParticipantStatus.ACCEPTED) {
      step.status = OnboardingStatus.ACCEPTED;
      await this._instanceStepRepo.save(step);

      await this._updateInstanceProgress(step.instanceId);
      this.logger.log(
        `Onboarding step ${step.id} marked as ACCEPTED because calendar event ${eventId} was ACCEPTED`,
      );
    } else if (status === ParticipantStatus.DECLINED) {
      step.status = OnboardingStatus.IN_PROGRESS;
      await this._instanceStepRepo.save(step);
      await this._updateInstanceProgress(step.instanceId);
    }
  }

  private async _completeStep(step: OnboardingInstanceStep) {
    step.status = OnboardingStatus.COMPLETED;
    step.completedAt = new Date();
    await this._instanceStepRepo.save(step);

    await this._updateInstanceProgress(step.instanceId);
  }

  private async _updateInstanceProgress(instanceId: string) {
    const steps = await this._instanceStepRepo.find({
      where: { instanceId },
    });

    if (steps.length === 0) return;

    const now = new Date();
    const completedSteps = steps.filter((s) => {
      // 1. Task/Step is explicitly COMPLETED
      if (s.status === OnboardingStatus.COMPLETED) return true;

      // 2. Meeting is ACCEPTED and the time has already passed
      if (s.status === OnboardingStatus.ACCEPTED && s.dueDate && s.dueDate <= now) {
        return true;
      }

      return false;
    }).length;

    const progress = Math.round((completedSteps / steps.length) * 100);

    const instance = await this._instanceRepo.findOneBy({ id: instanceId });
    if (instance) {
      instance.progress = progress;
      if (progress === 100) {
        instance.status = OnboardingStatus.COMPLETED;
        instance.completedAt = new Date();
      } else {
        instance.status = OnboardingStatus.IN_PROGRESS;
        instance.completedAt = null;
      }
      await this._instanceRepo.save(instance);
    }
  }
}
