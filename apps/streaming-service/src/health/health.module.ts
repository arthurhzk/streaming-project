import { Module } from '@nestjs/common';
import { HealthController } from '@streaming-service/health/health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
