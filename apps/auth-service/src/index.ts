import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import env from '@auth-service/config/env';
import { AppModule } from '@auth-service/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(env.PORT);
  console.log(`Auth service listening on port ${env.PORT}`);
}

bootstrap().catch(console.error);
