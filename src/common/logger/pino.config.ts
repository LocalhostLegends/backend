import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const lokiHost = isProduction
  ? process.env.GRAFANA_LOKI_HOST
  : (process.env.GRAFANA_LOKI_HOST ?? 'http://localhost:3100');

const lokiTransport = {
  target: 'pino-loki',
  options: {
    host: lokiHost,
    basicAuth: isProduction
      ? {
          username: process.env.GRAFANA_LOKI_USERNAME ?? '',
          password: process.env.GRAFANA_LOKI_PASSWORD ?? '',
        }
      : undefined,
    labels: {
      app: 'hrtech-backend',
      env: process.env.NODE_ENV ?? 'development',
      source: isProduction ? 'render' : 'local',
    },
    batching: true,
    interval: 5,
  },
};

const prettyTransport = {
  target: 'pino-pretty',
  options: {
    singleLine: false,
    colorize: !isProduction,
  },
};

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: {
    targets: [prettyTransport, lokiTransport],
  },
});
