import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as crypto from 'crypto';

@Injectable()
export class CloudflareService {
  private readonly logger = new Logger(CloudflareService.name);
  private s3Client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>(
      'CLOUDFLARE_ACCESS_KEY_ID',
    );
    const secretAccessKey = this.configService.get<string>(
      'CLOUDFLARE_SECRET_ACCESS_KEY',
    );
    const bucket = this.configService.get<string>('CLOUDFLARE_BUCKET_NAME');
    const publicUrl = this.configService.get<string>('CLOUDFLARE_PUBLIC_URL');

    if (
      !accountId ||
      !accessKeyId ||
      !secretAccessKey ||
      !bucket ||
      !publicUrl
    ) {
      this.logger.error('Missing Cloudflare R2 configuration');
      throw new Error('Missing Cloudflare R2 configuration');
    }

    this.bucket = bucket;
    this.publicUrl = publicUrl;

    this.s3Client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: { accessKeyId, secretAccessKey },
    });

    this.logger.log(`✅ Cloudflare R2 initialized`);
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

    this.logger.log(`✅ Avatar uploaded`);

    return { url: `${this.publicUrl}/${key}` };
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    this.logger.log(`✅ Avatar deleted`);
  }

  extractKeyFromUrl(url: string): string | null {
    return url.match(/\.(?:r2\.dev|com)\/(.+)$/)?.[1] || null;
  }
}
