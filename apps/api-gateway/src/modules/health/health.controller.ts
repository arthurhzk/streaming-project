import { Controller, Get, Param } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CircuitBreakerService } from '@api-gateway/modules/circuit-breaker/circuit-breaker.service';
import { ProxyService } from '@api-gateway/modules/proxy/proxy.service';

const HEALTH_CHECK_TIMEOUT = 3000;

type ServiceStatus = 'ok' | 'degraded' | 'down';
type CircuitState = 'closed' | 'open' | 'half-open';

interface ServiceHealth {
  status: ServiceStatus;
  circuitBreaker: CircuitState;
  responseTime?: number;
}

interface HealthResponse {
  status: ServiceStatus;
  services: Record<string, ServiceHealth>;
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly proxy: ProxyService,
  ) {}

  @Get()
  async checkAll(): Promise<HealthResponse> {
    const services = this.circuitBreaker.getRegisteredServices();
    const results: Record<string, ServiceHealth> = {};

    for (const name of services) {
      const url = this.proxy.getServiceUrl(name);
      if (!url) continue;

      const circuitState = this.circuitBreaker.getState(name) ?? 'closed';
      const start = Date.now();

      try {
        const response = await firstValueFrom(
          this.httpService.get(`${url.replace(/\/$/, '')}/health`, {
            timeout: HEALTH_CHECK_TIMEOUT,
            validateStatus: () => true,
          }),
        );
        const responseTime = Date.now() - start;
        const status: ServiceStatus =
          response.status >= 200 && response.status < 300
            ? 'ok'
            : response.status >= 400
              ? 'degraded'
              : 'down';

        results[name] = {
          status,
          circuitBreaker: circuitState as CircuitState,
          responseTime,
        };
      } catch {
        results[name] = {
          status: 'down',
          circuitBreaker: circuitState as CircuitState,
          responseTime: Date.now() - start,
        };
      }
    }

    const statuses = Object.values(results).map((s) => s.status);
    const overall: ServiceStatus = statuses.every((s) => s === 'ok')
      ? 'ok'
      : statuses.some((s) => s === 'ok')
        ? 'degraded'
        : 'down';

    return { status: overall, services: results };
  }

  @Get(':service')
  async checkService(@Param('service') service: string): Promise<HealthResponse> {
    const url = this.proxy.getServiceUrl(service);
    if (!url) {
      return {
        status: 'down',
        services: {
          [service]: {
            status: 'down',
            circuitBreaker: 'closed',
          },
        },
      };
    }

    const circuitState = this.circuitBreaker.getState(service) ?? 'closed';
    const start = Date.now();

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${url.replace(/\/$/, '')}/health`, {
          timeout: HEALTH_CHECK_TIMEOUT,
          validateStatus: () => true,
        }),
      );
      const responseTime = Date.now() - start;
      const status: ServiceStatus =
        response.status >= 200 && response.status < 300
          ? 'ok'
          : response.status >= 400
            ? 'degraded'
            : 'down';

      return {
        status,
        services: {
          [service]: {
            status,
            circuitBreaker: circuitState as CircuitState,
            responseTime,
          },
        },
      };
    } catch {
      return {
        status: 'down',
        services: {
          [service]: {
            status: 'down',
            circuitBreaker: circuitState as CircuitState,
            responseTime: Date.now() - start,
          },
        },
      };
    }
  }
}
