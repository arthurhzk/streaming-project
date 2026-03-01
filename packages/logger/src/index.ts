import pino, { type Logger } from 'pino';

export type { Logger };

export function createLogger(serviceName: string): Logger {
  const isProduction = process.env.NODE_ENV === 'production';

  const base = pino({
    name: serviceName,
    level: process.env.LOG_LEVEL ?? 'info',
    ...(isProduction
      ? {}
      : {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
            },
          },
        }),
  });

  return base.child({ service: serviceName });
}
