import '@common/init/env';

import { DataSource } from 'typeorm';

import config from '@config/app.config';

const rootDir = config.isProduction ? 'dist' : 'src';
const fileExtension = config.isProduction ? 'js' : 'ts';

export default new DataSource({
  type: 'postgres',
  ...config.database,
  entities: [`${rootDir}/**/*.entity.${fileExtension}`],
  migrations: [`${rootDir}/database/migrations/*.${fileExtension}`],
  synchronize: false,
});
