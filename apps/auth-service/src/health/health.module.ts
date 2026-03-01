import { Module } from '@nestjs/common';
import { HealthController } from '@auth-service/health/health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
