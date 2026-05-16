import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import 'multer';

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
    }

    this.s3Client = new S3Client({
      endpoint: config.storage.endpoint,
      region: 'auto',
      credentials: {
        accessKeyId: config.storage.accessKeyId,
        secretAccessKey: config.storage.secretAccessKey,
      },
      forcePathStyle: config.storage.provider === 'minio',
    });

    this.logger.log(`Storage initialized with ${config.storage.provider}`);
  }

  private sanitizeEmail(email: string): string {
    return email.toLowerCase().replace(/[@.]/g, '_');
  }

  private generateFileName(originalName: string): string {
    const ext = originalName.split('.').pop();
    return `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  }

  async checkHealth(): Promise<{
    status: string;
    storage: string;
    provider: string;
  }> {
    await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: config.storage.bucketName,
        MaxKeys: 1,
      }),
    );

    return {
      status: 'ok',
      storage: 'connected',
      provider: config.storage.provider,
    };
  }

  /**
   * Generates a signed URL for temporary access to a private file
   * @param key S3 Object Key
   * @param expiresIn Seconds until expiration (default 1 hour)
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: config.storage.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async uploadAvatar(
    file: Express.Multer.File,
    companyId: string,
    userEmail: string,
    oldAvatarUrl?: string | null,
  ): Promise<{ url: string }> {
    if (oldAvatarUrl) {
      const oldKey = this.extractKeyFromUrl(oldAvatarUrl);

      if (oldKey) {
        try {
          await this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: config.storage.bucketName,
              Key: oldKey,
            }),
          );
          this.logger.log(`Deleted old avatar`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(`Failed to delete old avatar: ${errorMessage}`);
        }
      }
    }

    const sanitizedEmail = this.sanitizeEmail(userEmail);
    const fileName = this.generateFileName(file.originalname);
    const key = `public/avatars/${companyId}/${sanitizedEmail}/${fileName}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: config.storage.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    this.logger.log(`Avatar uploaded: ${key}`);

    return { url: `${config.storage.publicUrl.replace(/\/$/, '')}/${key}` };
  }

  async getFileUrlIfExists(key: string): Promise<string | null> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: config.storage.bucketName,
          Key: key,
        }),
      );
      return `${config.storage.publicUrl.replace(/\/$/, '')}/${key}`;
    } catch {
      return null;
    }
  }

  async uploadSeedAvatar(file: Express.Multer.File, fileName: string): Promise<{ url: string }> {
    const key = `seed/avatars/${fileName}`;

    // Check if exists first to save bandwidth and operations
    const existingUrl = await this.getFileUrlIfExists(key);
    if (existingUrl) {
      return { url: existingUrl };
    }

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: config.storage.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    this.logger.log(`Seed avatar uploaded: ${key}`);
    return { url: `${config.storage.publicUrl.replace(/\/$/, '')}/${key}` };
  }

  /**
   * Uploads a file to a public path (accessible via public URL)
   */
  async uploadFile(file: Express.Multer.File, path: string): Promise<{ url: string; key: string }> {
    const fileName = this.generateFileName(file.originalname);
    const key = `public/${path}/${fileName}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: config.storage.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    this.logger.log(`Public file uploaded: ${key}`);

    return {
      url: `${config.storage.publicUrl.replace(/\/$/, '')}/${key}`,
      key,
    };
  }

  /**
   * Uploads a file to a private path (requires signed URL for access)
   */
  async uploadPrivateFile(file: Express.Multer.File, path: string): Promise<{ key: string }> {
    const fileName = this.generateFileName(file.originalname);
    const key = `private/${path}/${fileName}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: config.storage.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Cloudflare R2 ignores ACLs, but we use the path to distinguish
      }),
    );

    this.logger.log(`Private file uploaded: ${key}`);

    return { key };
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: config.storage.bucketName,
        Key: key,
      }),
    );
    this.logger.log(`File deleted: ${key}`);
  }

  extractKeyFromUrl(url: string): string | null {
    try {
      const publicUrl = config.storage.publicUrl.replace(/\/$/, '');

      if (url.startsWith(publicUrl)) {
        return url.replace(publicUrl, '').replace(/^\//, '');
      }

      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);

      if (config.storage.provider === 'minio' && !publicUrl.includes(config.storage.bucketName)) {
        if (parts[0] === config.storage.bucketName) {
          parts.shift();
        }
      }

      return parts.length ? parts.join('/') : null;
    } catch {
      return null;
    }
  }
}
