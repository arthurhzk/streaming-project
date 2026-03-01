import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CircuitBreakerModule } from '@api-gateway/modules/circuit-breaker/circuit-breaker.module';
import { HealthController } from '@api-gateway/modules/health/health.controller';
import { ProxyModule } from '@api-gateway/modules/proxy/proxy.module';

@Module({
  imports: [HttpModule.register({ timeout: 5000 }), CircuitBreakerModule, ProxyModule],
  controllers: [HealthController],
})
export class HealthModule {}
