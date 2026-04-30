import ms from 'ms';
import { z } from 'zod';

const msStringValueValidator = z.string().regex(/^\d+(s|m|h|d|ms)?$/) as z.ZodType<ms.StringValue>;

export default z.object({
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
    provider: z.enum(['smtp', 'resend']).default('smtp'),
    resendApiKey: z.string().optional(),
    from: z.string().optional(),
  }),

  smtp: z.object({
    host: z.string(),
    port: z.number(),
    secure: z.boolean(),
    user: z.string(),
    password: z.string(),
    sender: z.object({
      email: z.string(),
      name: z.string(),
    }),
  }),

  frontend: z.object({
    url: z.string(),
  }),

  deploy: z.object({
    commit: z.string(),
    branch: z.string(),
  }),
});
