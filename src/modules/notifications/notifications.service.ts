import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@database/entities/notification.entity';
import { NotificationType } from '@common/enums/notification-type.enum';
import { PaginationService } from '@modules/pagination/pagination.service';
import { PaginationQueryDto } from '@modules/pagination/dto/pagination-query.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly paginationService: PaginationService,
  ) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...data,
      isRead: false,
    });
    return this.notificationRepository.save(notification);
  }

  async findAllForUser(userId: string, query: PaginationQueryDto) {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.user_id = :userId', { userId })
      .orderBy(`notification.${query.sortBy}`, query.sortOrder);

    return this.paginationService.paginate(queryBuilder, query.page || 1, query.limit || 10);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async delete(userId: string, notificationId: string): Promise<void> {
    const result = await this.notificationRepository.delete({ id: notificationId, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Notification not found');
    }
  }
}
