export default () => ({
  port: parseInt(process.env.PORT ?? '3175', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  nodeEnv: process.env.NODE_ENV ?? 'development',

  database: process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_DATABASE ?? 'marketplace',
        ssl: false,
      },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },

  cors: {
    origins: (process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },

  pgAdmin: {
    email: process.env.PG_ADMIN_EMAIL ?? 'admin@admin.com',
    password: process.env.PG_ADMIN_PASSWORD ?? 'admin',
    port: process.env.PG_ADMIN_PORT ?? '5050',
  },

  storage: {
    accountId: process.env.STORAGE_ACCOUNT_ID,
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
    bucketName: process.env.STORAGE_BUCKET_NAME,
    publicUrl: process.env.STORAGE_PUBLIC_URL,
    endpoint: process.env.STORAGE_ENDPOINT,
  },
});
