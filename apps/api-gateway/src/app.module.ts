import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import env from '@api-gateway/config/env';
import { CorrelationIdMiddleware } from '@api-gateway/middleware/correlation-id.middleware';
import { LoggingMiddleware } from '@api-gateway/middleware/logging.middleware';
import { AuthModule } from '@api-gateway/modules/auth/auth.module';
import { CircuitBreakerModule } from '@api-gateway/modules/circuit-breaker/circuit-breaker.module';
import { HealthModule } from '@api-gateway/modules/health/health.module';
import { ProxyModule } from '@api-gateway/modules/proxy/proxy.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: env.RATE_LIMIT_TTL * 1000,
        limit: env.RATE_LIMIT_MAX,
        skipIf: (ctx) => {
          const req = ctx.switchToHttp().getRequest();
          return req.path?.startsWith('/auth') ?? false;
        },
      },
      {
        name: 'auth',
        ttl: 60 * 1000,
        limit: 10,
        skipIf: (ctx) => {
          const req = ctx.switchToHttp().getRequest();
          return !req.path?.startsWith('/auth');
        },
      },
    ]),
    AuthModule,
    CircuitBreakerModule,
    HealthModule,
    ProxyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware, LoggingMiddleware).forRoutes('*');
  }
}
