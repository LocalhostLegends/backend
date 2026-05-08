import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    if (!line || line.startsWith('#')) return;

    const firstEqualIndex = line.indexOf('=');
    if (firstEqualIndex !== -1) {
      const key = line.substring(0, firstEqualIndex).trim();
      let value = line.substring(firstEqualIndex + 1).trim();

      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }

      if (key) {
        process.env[key] = value;
      }
    }
  });
}

const defaults: Record<string, string> = {
  NODE_ENV: 'test',
  PORT: '3175',
  API_PREFIX: 'api',
  JWT_SECRET: 'super-secret-key',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_SECRET: 'super-refresh-secret-key',
  JWT_REFRESH_EXPIRES_IN: '7d',
  STORAGE_PROVIDER: 'minio',
  STORAGE_ACCESS_KEY_ID: 'minioadmin',
  STORAGE_SECRET_ACCESS_KEY: 'minioadmin',
  STORAGE_BUCKET_NAME: 'backend',
  STORAGE_PUBLIC_URL: 'http://localhost:9000/backend',
  STORAGE_ENDPOINT: 'http://localhost:9000',
  FRONTEND_URL: 'http://localhost:4200',
  CORS_ORIGINS: 'http://localhost:4200',
  EMAIL_PROVIDER: 'smtp',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  SMTP_USER: 'your-email@gmail.com',
  SMTP_PASSWORD: 'your-app-password',
  SMTP_SENDER_EMAIL: 'noreply@yourdomain.com',
  SMTP_SENDER_NAME: 'Backend API',
  GIT_COMMIT: 'test-commit',
  GIT_BRANCH: 'test-branch',
};

Object.keys(defaults).forEach((key) => {
  if (!process.env[key]) {
    process.env[key] = defaults[key];
  }
});
