import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly isUsedCloudflare: boolean;
  private s3Client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(configService: ConfigService) {
    const accountId = configService.get<string>('STORAGE_ACCOUNT_ID');
    const accessKeyId = configService.get<string>('STORAGE_ACCESS_KEY_ID');
    const secretAccessKey = configService.get<string>('STORAGE_SECRET_ACCESS_KEY');
    const bucket = configService.get<string>('STORAGE_BUCKET_NAME');
    const publicUrl = configService.get<string>('STORAGE_PUBLIC_URL');
    const endpoint = configService.get<string>('STORAGE_ENDPOINT');

    this.logger.log(
      `Storage config: bucket=${bucket}, publicUrl=${publicUrl}, endpoint=${endpoint}`,
    );

    if (!accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
      this.logger.error('Missing Storage configuration');
      throw new Error('Missing Storage configuration');
    }

    if (!accountId && !endpoint) {
      this.logger.error(
        'Incorrect Storage configuration. Storage account id or storage endpoint must be provided',
      );
      throw new Error(
        'Incorrect Storage configuration. Storage account id or storage endpoint must be provided',
      );
    }

    this.bucket = bucket;
    this.publicUrl = publicUrl;

    this.isUsedCloudflare = !endpoint;

    this.s3Client = new S3Client({
      endpoint: this.isUsedCloudflare ? `https://${accountId}.r2.cloudflarestorage.com` : endpoint,
      region: 'auto',
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });

    this.logger.log(
      `✅ Storage initialized with ${this.isUsedCloudflare ? 'Cloudflare R2' : 'MinIO'}`,
    );
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
            Bucket: this.bucket,
            Key: oldKey,
          }),
        );
        this.logger.log(`✅ Deleted old avatar`);
      }
    }

    const key = `users/${this.sanitizeEmail(userEmail)}/avatar/${this.generateFileName(file.originalname)}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    this.logger.log(`✅ Avatar uploaded: ${key}`);

    return { url: `${this.publicUrl}/${key}` };
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    this.logger.log(`✅ File deleted: ${key}`);
  }

  extractKeyFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);

      if (!this.isUsedCloudflare) {
        parts.shift();
      }

      return parts.length ? parts.join('/') : null;
    } catch {
      return null;
    }
  }
}
