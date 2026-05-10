import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotificationSetting } from '@database/entities/user-notification-setting.entity';
import { NotificationType } from '@common/enums/notification-type.enum';

@Injectable()
export class NotificationsSettingsService {
  constructor(
    @InjectRepository(UserNotificationSetting)
    private readonly settingsRepository: Repository<UserNotificationSetting>,
  ) {}

  async getSettings(userId: string) {
    const userSettings = await this.settingsRepository.find({
      where: { userId },
    });

    // Merge with all available types (default to true if not found)
    const allTypes = Object.values(NotificationType);
    return allTypes.map((type) => {
      const setting = userSettings.find((s) => s.type === type);
      return {
        type,
        isEnabled: setting ? setting.isEnabled : true,
      };
    });
  }

  async updateSetting(userId: string, type: NotificationType, isEnabled: boolean) {
    let setting = await this.settingsRepository.findOne({
      where: { userId, type },
    });

    if (setting) {
      setting.isEnabled = isEnabled;
    } else {
      setting = this.settingsRepository.create({
        userId,
        type,
        isEnabled,
      });
    }

    return this.settingsRepository.save(setting);
  }

  async isNotificationEnabled(userId: string, type: NotificationType): Promise<boolean> {
    const setting = await this.settingsRepository.findOne({
      where: { userId, type },
    });

    return setting ? setting.isEnabled : true;
  }
}
