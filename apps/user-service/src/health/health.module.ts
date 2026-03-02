import { Module } from '@nestjs/common';
import { HealthController } from '@user-service/health/health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
