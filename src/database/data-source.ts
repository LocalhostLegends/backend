import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

const isProduction = process.env.NODE_ENV === 'production';
const hasDatabaseUrl = !!process.env.DATABASE_URL;

const rootDir = isProduction ? 'dist' : 'src';
const fileExtension = isProduction ? 'js' : 'ts';

export default new DataSource({
  type: 'postgres',
  ...(hasDatabaseUrl
    ? {
        url: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      }),
  entities: [`${rootDir}/**/*.entity.${fileExtension}`],
  migrations: [`${rootDir}/database/migrations/*.${fileExtension}`],
  synchronize: false,
});
