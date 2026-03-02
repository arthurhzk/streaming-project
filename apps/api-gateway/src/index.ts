import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import env from '@api-gateway/config/env';
import { AppModule } from '@api-gateway/app.module';
import { ThrottlerExceptionFilter } from '@api-gateway/filters/throttler-exception.filter';
import { createLogger } from '@repo/logger';
import helmet from 'helmet';

const logger = createLogger('api-gateway');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "'data:'", "'https:'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalFilters(new ThrottlerExceptionFilter());
  await app.listen(env.PORT);
  logger.info(`API Gateway listening on port ${env.PORT}`);
}

bootstrap().catch((err) => logger.error({ err }, 'Failed to start'));
