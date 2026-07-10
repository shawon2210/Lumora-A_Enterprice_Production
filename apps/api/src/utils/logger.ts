import winston from 'winston';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    isDev ? winston.format.combine(winston.format.colorize(), winston.format.simple()) : winston.format.json(),
  ),
  defaultMeta: { service: 'lumora-api' },
  transports: [new winston.transports.Console()],
});
