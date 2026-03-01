import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import env from '@api-gateway/config/env';
import { CircuitBreakerService } from '@api-gateway/modules/circuit-breaker/circuit-breaker.service';
import { createLogger } from '@repo/logger';

const logger = createLogger('api-gateway');

const SERVICE_URL_MAP: Record<string, () => string> = {
  auth: () => env.AUTH_SERVICE_URL,
};

@Injectable()
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  getServiceUrl(serviceName: string): string | null {
    const getter = SERVICE_URL_MAP[serviceName];
    return getter ? getter() : null;
  }

  async forward(
    serviceName: string,
    req: Request,
  ): Promise<{ status: number; data: unknown; headers: Record<string, string> }> {
    const baseUrl = this.getServiceUrl(serviceName);
    if (!baseUrl) {
      throw new ServiceUnavailableException(`Unknown service: ${serviceName}`);
    }

    const targetUrl = `${baseUrl.replace(/\/$/, '')}${req.path}`;
    const correlationId = req.headers['x-correlation-id'] as string | undefined;
    const forwardedFor =
      (req.headers['x-forwarded-for'] as string) ?? req.socket?.remoteAddress ?? '';

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'host') continue;
      if (value !== undefined && value !== '') {
        headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
    }
    headers['x-correlation-id'] = correlationId ?? '';
    headers['x-forwarded-for'] = forwardedFor;

    const makeRequest = async () => {
      const rawResponse = await firstValueFrom(
        this.httpService.request({
          method: req.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS',
          url: targetUrl,
          headers,
          data: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
          timeout: env.REQUEST_TIMEOUT_MS,
          validateStatus: () => true,
        }),
      );

      const responseHeaders: Record<string, string> = {};
      if (rawResponse.headers) {
        for (const [key, value] of Object.entries(rawResponse.headers)) {
          if (value !== undefined && value !== '') {
            const str = Array.isArray(value) ? value.join(', ') : String(value);
            if (key.toLowerCase() !== 'transfer-encoding') {
              responseHeaders[key] = str;
            }
          }
        }
      }

      return {
        status: rawResponse.status,
        data: rawResponse.data,
        headers: responseHeaders,
      };
    };

    try {
      return await this.circuitBreaker.execute(serviceName, makeRequest);
    } catch (err) {
      const state = this.circuitBreaker.getState(serviceName);
      if (state === 'open') {
        logger.warn(
          { service: serviceName, correlationId: correlationId ?? '-' },
          `Service ${serviceName} is temporarily unavailable`,
        );
        throw new ServiceUnavailableException(`Service ${serviceName} is temporarily unavailable`);
      }
      throw err;
    }
  }
}
