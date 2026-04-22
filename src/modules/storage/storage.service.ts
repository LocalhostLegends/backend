import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';

import config from '@config/app.config';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;

  constructor() {
    if (!config.isProduction) {
      this.logger.log(
        `Storage config: bucket=${config.storage.bucketName}, publicUrl=${config.storage.publicUrl}, endpoint=${config.storage.endpoint}`,
      );
    } else {
      this.logger.log('Storage initialized with Cloudflare R2');
    }

    this.s3Client = new S3Client({
      endpoint: config.storage.endpoint,
      region: 'auto',
      credentials: {
        accessKeyId: config.storage.accessKeyId,
        secretAccessKey: config.storage.secretAccessKey,
      },
      forcePathStyle: true,
    });

    this.logger.log(`✅ Storage initialized with ${config.storage.provider}`);
  }

  private sanitizeEmail(email: string): string {
    return email.toLowerCase().replace(/[@.]/g, '_');
  }

  private generateFileName(originalName: string): string {
    const ext = originalName.split('.').pop();
    return `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  }

  async uploadAvatar(
    file: Express.Multer.File,
    userEmail: string,
    oldAvatarUrl?: string | null,
  ): Promise<{ url: string }> {
    if (oldAvatarUrl) {
      const oldKey = this.extractKeyFromUrl(oldAvatarUrl);

      if (oldKey) {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: config.storage.bucketName,
            Key: oldKey,
          }),
        );
        this.logger.log(`✅ Deleted old avatar`);
      }
    }

    const key = `users/${this.sanitizeEmail(userEmail)}/avatar/${this.generateFileName(file.originalname)}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: config.storage.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    this.logger.log(`✅ Avatar uploaded: ${key}`);

    return { url: `${config.storage.publicUrl}/${key}` };
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: config.storage.bucketName,
        Key: key,
      }),
    );
    this.logger.log(`✅ File deleted: ${key}`);
  }

  extractKeyFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);

      if (config.storage.provider === 'minio') {
        parts.shift();
      }

      return parts.length ? parts.join('/') : null;
    } catch {
      return null;
    }
  }
}
