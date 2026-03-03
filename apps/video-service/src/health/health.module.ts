import { Module } from '@nestjs/common';
import { HealthController } from '@video-service/health/health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
