import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: isProduction ? 'info' : 'debug',

  transport: isProduction
    ? {
        target: 'pino-loki',
        options: {
          host: process.env.GRAFANA_LOKI_HOST,
          basicAuth: {
            username: process.env.GRAFANA_LOKI_USERNAME ?? '',
            password: process.env.GRAFANA_LOKI_PASSWORD ?? '',
          },
          labels: {
            app: 'hrtech-backend',
            env: process.env.NODE_ENV ?? 'production',
            source: 'render',
          },
          batching: true,
          interval: 5,
        },
      }
    : {
        target: 'pino-pretty',
        options: {
          singleLine: false,
          colorize: true,
        },
      },
});
