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
      ssl: z.union([z.object({ rejectUnauthorized: z.literal(false) }), z.literal(false)]),
    }),
    z.object({
      host: z.string(),
      port: z.number(),
      username: z.string(),
      password: z.string(),
      database: z.string(),
      ssl: z.literal(false),
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

  storage: z.union([
    z.object({
      provider: z.literal('cloudflare'),
      accountId: z.string(),
      accessKeyId: z.string(),
      secretAccessKey: z.string(),
      bucketName: z.string(),
      publicUrl: z.string(),
      endpoint: z.string(),
    }),
    z.object({
      provider: z.literal('minio'),
      accessKeyId: z.string(),
      secretAccessKey: z.string(),
      bucketName: z.string(),
      publicUrl: z.string(),
      endpoint: z.string(),
    }),
  ]),

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
});
