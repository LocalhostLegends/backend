import configSchema from './app.config.schema';

const isProduction = process.env.NODE_ENV === 'production';
const storageAccountId = process.env.STORAGE_ACCOUNT_ID;

export default configSchema.parse({
  isProduction,

  port: Number(process.env.PORT),
  apiPrefix: process.env.API_PREFIX,
  nodeEnv: process.env.NODE_ENV,

  database: process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        ssl: false,
      },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },

  cors: {
    origins: (process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },

  pgAdmin: {
    user: process.env.PG_ADMIN_USER,
    password: process.env.PG_ADMIN_PASSWORD,
    port: Number(process.env.PG_ADMIN_PORT),
  },

  storage: isProduction
    ? {
        provider: 'cloudflare',
        accountId: storageAccountId,
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
        bucketName: process.env.STORAGE_BUCKET_NAME,
        publicUrl: process.env.STORAGE_PUBLIC_URL,
        endpoint: `https://${storageAccountId}.r2.cloudflarestorage.com`,
      }
    : {
        provider: 'minio',
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
        bucketName: process.env.STORAGE_BUCKET_NAME,
        publicUrl: process.env.STORAGE_PUBLIC_URL,
        endpoint: process.env.STORAGE_ENDPOINT,
      },

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : undefined,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    sender: {
      email: process.env.SMTP_SENDER_EMAIL,
      name: process.env.SMTP_SENDER_NAME,
    },
  },

  frontend: {
    url: process.env.FRONTEND_URL,
  },
});
