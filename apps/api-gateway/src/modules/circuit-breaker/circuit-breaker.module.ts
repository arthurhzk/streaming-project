import { Module, OnModuleInit } from '@nestjs/common';
import env from '@api-gateway/config/env';
import { CircuitBreakerService } from '@api-gateway/modules/circuit-breaker/circuit-breaker.service';

@Module({
  providers: [CircuitBreakerService],
  exports: [CircuitBreakerService],
})
export class CircuitBreakerModule implements OnModuleInit {
  constructor(private readonly circuitBreaker: CircuitBreakerService) {}

  onModuleInit(): void {
    this.circuitBreaker.register({
      name: 'auth',
      url: env.AUTH_SERVICE_URL,
    });
    this.circuitBreaker.register({
      name: 'user',
      url: env.USER_SERVICE_URL,
    });
  }
}
