import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import env from '@api-gateway/config/env';
import { CircuitBreakerModule } from '@api-gateway/modules/circuit-breaker/circuit-breaker.module';
import { ProxyController } from '@api-gateway/modules/proxy/proxy.controller';
import { ProxyService } from '@api-gateway/modules/proxy/proxy.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: env.REQUEST_TIMEOUT_MS,
    }),
    CircuitBreakerModule,
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
