import { Module } from '@nestjs/common';
import { HealthModule } from '@notification-service/health/health.module';

@Module({
  imports: [HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
