import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import env from '@api-gateway/config/env';
import { AppModule } from '@api-gateway/app.module';
import { ThrottlerExceptionFilter } from '@api-gateway/filters/throttler-exception.filter';
import { createLogger } from '@repo/logger';

const logger = createLogger('api-gateway');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ThrottlerExceptionFilter());
  await app.listen(env.PORT);
  logger.info(`API Gateway listening on port ${env.PORT}`);
}

bootstrap().catch((err) => logger.error({ err }, 'Failed to start'));
