import ms from 'ms';
import { z } from 'zod';

const msStringValueValidator = z.string().regex(/^\d+(s|m|h|d|ms)?$/) as z.ZodType<ms.StringValue>;

export default z
  .object({
    isProduction: z.boolean(),

    port: z.number(),
    apiPrefix: z.string(),
    nodeEnv: z.enum(['development', 'production']),

    database: z.union([
      z.object({
        url: z.string(),
        ssl: z.union([z.object({ rejectUnauthorized: z.boolean() }), z.boolean()]),
      }),
      z.object({
        host: z.string(),
        port: z.number(),
        username: z.string(),
        password: z.string(),
        database: z.string(),
        ssl: z.union([z.object({ rejectUnauthorized: z.boolean() }), z.boolean()]),
      }),
    ]),

    jwt: z.object({
      secret: z.string(),
      expiresIn: msStringValueValidator,
      refreshSecret: z.string(),
      refreshExpiresIn: msStringValueValidator,
    }),

    cors: z.object({
      origins: z.array(z.string()),
    }),

    pgAdmin: z.object({
      user: z.string(),
      password: z.string(),
      port: z.number(),
    }),

    storage: z.object({
      provider: z.enum(['cloudflare', 'minio']),
      accountId: z.string().optional(),
      accessKeyId: z.string(),
      secretAccessKey: z.string(),
      bucketName: z.string(),
      publicUrl: z.string(),
      endpoint: z.string(),
    }),

    email: z.object({
      provider: z.enum(['smtp', 'resend']),
      resendApiKey: z.string().optional(),
      from: z.string().optional(),
    }),

    smtp: z.object({
      host: z.string().optional(),
      port: z.number(),
      secure: z.boolean(),
      user: z.string().optional(),
      password: z.string().optional(),
      sender: z.object({
        email: z.string().optional(),
        name: z.string().optional(),
      }),
    }),

    frontend: z.object({
      url: z.string(),
    }),

    deploy: z.object({
      commit: z.string(),
      branch: z.string(),
    }),
  })
  .superRefine((config, ctx) => {
    if (config.email.provider === 'resend') {
      if (!config.email.resendApiKey) {
        ctx.addIssue({
          code: 'custom',
          path: ['email', 'resendApiKey'],
          message: 'EMAIL_API_KEY is required when EMAIL_PROVIDER=resend',
        });
      }

      if (!config.email.from) {
        ctx.addIssue({
          code: 'custom',
          path: ['email', 'from'],
          message: 'EMAIL_FROM is required when EMAIL_PROVIDER=resend',
        });
      }
    }

    if (config.email.provider === 'smtp') {
      if (!config.smtp.host) {
        ctx.addIssue({
          code: 'custom',
          path: ['smtp', 'host'],
          message: 'SMTP_HOST is required when EMAIL_PROVIDER=smtp',
        });
      }

      if (!config.smtp.user) {
        ctx.addIssue({
          code: 'custom',
          path: ['smtp', 'user'],
          message: 'SMTP_USER is required when EMAIL_PROVIDER=smtp',
        });
      }

      if (!config.smtp.password) {
        ctx.addIssue({
          code: 'custom',
          path: ['smtp', 'password'],
          message: 'SMTP_PASSWORD is required when EMAIL_PROVIDER=smtp',
        });
      }

      if (!config.smtp.sender.email) {
        ctx.addIssue({
          code: 'custom',
          path: ['smtp', 'sender', 'email'],
          message: 'SMTP_SENDER_EMAIL is required when EMAIL_PROVIDER=smtp',
        });
      }

      if (!config.smtp.sender.name) {
        ctx.addIssue({
          code: 'custom',
          path: ['smtp', 'sender', 'name'],
          message: 'SMTP_SENDER_NAME is required when EMAIL_PROVIDER=smtp',
        });
      }
    }
  });
