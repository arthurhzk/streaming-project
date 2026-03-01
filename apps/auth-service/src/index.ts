import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import env from '@auth-service/config/env';
import { AppModule } from '@auth-service/app.module';
import { createLogger } from '@repo/logger';

const logger = createLogger('auth-service');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(env.PORT);
  logger.info(`Auth service listening on port ${env.PORT}`);
}

bootstrap().catch((err) => logger.error({ err }, 'Failed to start'));
