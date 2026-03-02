import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import env from '@video-service/config/env';
import { AppModule } from '@video-service/app.module';
import { createLogger } from '@repo/logger';

const logger = createLogger('video-service');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(env.PORT);
  logger.info(`Video service listening on port ${env.PORT}`);
}

bootstrap().catch((err) => logger.error({ err }, 'Failed to start'));
