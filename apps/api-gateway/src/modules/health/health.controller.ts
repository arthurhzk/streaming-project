/* eslint-disable security/detect-object-injection */
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

function statusFromHttpCode(code: number): ServiceStatus {
  if (code >= 200 && code < 300) return 'ok';
  if (code >= 400) return 'degraded';
  return 'down';
}

function overallStatus(statuses: ServiceStatus[]): ServiceStatus {
  const allOk = statuses.every((s) => s === 'ok');
  if (allOk) return 'ok';

  const someOk = statuses.some((s) => s === 'ok');
  if (someOk) return 'degraded';

  return 'down';
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

      const serviceHealth = await this.checkOne(name, url);
      results[name] = serviceHealth;
    }

    const statuses = Object.values(results).map((s) => s.status);
    const status = overallStatus(statuses);

    return { status, services: results };
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

    const serviceHealth = await this.checkOne(service, url);

    return {
      status: serviceHealth.status,
      services: {
        [service]: serviceHealth,
      },
    };
  }

  private async checkOne(name: string, url: string): Promise<ServiceHealth> {
    const circuitState = this.circuitBreaker.getState(name) ?? 'closed';
    const start = Date.now();

    try {
      const healthUrl = `${url.replace(/\/$/, '')}/health`;
      const response = await firstValueFrom(
        this.httpService.get(healthUrl, {
          timeout: HEALTH_CHECK_TIMEOUT,
          validateStatus: () => true,
        }),
      );

      const responseTime = Date.now() - start;
      const status = statusFromHttpCode(response.status);

      return {
        status,
        circuitBreaker: circuitState as CircuitState,
        responseTime,
      };
    } catch {
      const responseTime = Date.now() - start;
      return {
        status: 'down',
        circuitBreaker: circuitState as CircuitState,
        responseTime,
      };
    }
  }
}
