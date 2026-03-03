/* eslint-disable security/detect-object-injection */
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
  user: () => env.USER_SERVICE_URL,
  notification: () => env.NOTIFICATION_SERVICE_URL,
  videos: () => env.VIDEO_SERVICE_URL,
};

const SKIPPED_REQUEST_HEADERS = new Set(['authorization', 'host']);
const SKIPPED_RESPONSE_HEADERS = new Set(['transfer-encoding']);

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

@Injectable()
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  getServiceUrl(serviceName: string): string | null {
    return SERVICE_URL_MAP[serviceName]?.() ?? null;
  }

  async forward(serviceName: string, req: Request) {
    const baseUrl = this.getServiceUrl(serviceName);
    if (!baseUrl) throw new ServiceUnavailableException(`Unknown service: ${serviceName}`);

    const targetUrl = `${baseUrl.replace(/\/$/, '')}${req.path}`;
    const correlationId = req.headers['x-correlation-id'] as string | undefined;
    const forwardedFor =
      (req.headers['x-forwarded-for'] as string) ?? req.socket?.remoteAddress ?? '';

    const requestHeaders = this.buildHeaders(req.headers, SKIPPED_REQUEST_HEADERS);
    requestHeaders['x-correlation-id'] = correlationId ?? '';
    requestHeaders['x-forwarded-for'] = forwardedFor;

    const isMultipart =
      typeof req.headers['content-type'] === 'string' &&
      req.headers['content-type'].toLowerCase().includes('multipart/form-data');
    const body = isMultipart ? req : req.body;
    const timeoutMs = isMultipart ? env.UPLOAD_TIMEOUT_MS : env.REQUEST_TIMEOUT_MS;

    // Multipart uploads bypass circuit breaker: they need a long timeout and must not
    // trip the breaker when large files take time. Circuit breaker uses 10s default.
    try {
      if (isMultipart) {
        return await this.makeRequest(
          req.method as HttpMethod,
          targetUrl,
          requestHeaders,
          body,
          timeoutMs,
        );
      }
      return await this.circuitBreaker.execute(serviceName, () =>
        this.makeRequest(req.method as HttpMethod, targetUrl, requestHeaders, body, timeoutMs),
      );
    } catch (err) {
      if (this.circuitBreaker.getState(serviceName) === 'open') {
        logger.warn(
          { service: serviceName, correlationId: correlationId ?? '-' },
          `Service ${serviceName} is temporarily unavailable`,
        );
        throw new ServiceUnavailableException(`Service ${serviceName} is temporarily unavailable`);
      }
      throw err;
    }
  }

  private async makeRequest(
    method: HttpMethod,
    url: string,
    headers: Record<string, string>,
    body: unknown,
    timeoutMs = env.REQUEST_TIMEOUT_MS,
  ) {
    const res = await firstValueFrom(
      this.httpService.request({
        method,
        url,
        headers,
        data: method !== 'GET' && method !== 'HEAD' ? body : undefined,
        timeout: timeoutMs,
        validateStatus: () => true,
      }),
    );

    return {
      status: res.status,
      data: res.data,
      headers: this.buildHeaders(
        res.headers as Record<string, string | string[] | undefined>,
        SKIPPED_RESPONSE_HEADERS,
      ),
    };
  }

  private buildHeaders(
    source: Record<string, string | string[] | undefined>,
    skip: Set<string>,
  ): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(source)) {
      if (skip.has(key.toLowerCase()) || !value) continue;
      result[key] = Array.isArray(value) ? value.join(', ') : String(value);
    }
    return result;
  }
}
