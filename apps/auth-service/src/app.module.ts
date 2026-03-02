import { Module } from '@nestjs/common';
import { PrismaModule } from '@auth-service/prisma/prisma.module';
import { AuthModule } from '@auth-service/auth/auth.module';
import { HealthModule } from '@auth-service/health/health.module';
import { EventsModule } from '@auth-service/events/events.module';

@Module({
  imports: [PrismaModule, AuthModule, HealthModule, EventsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
