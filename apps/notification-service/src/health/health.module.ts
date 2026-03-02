import { Module } from '@nestjs/common';
import { HealthController } from '@notification-service/health/health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
