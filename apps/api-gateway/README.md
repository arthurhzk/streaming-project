# API Gateway

The API Gateway is the single entry point for all external requests. It validates JWT tokens, applies rate limiting, and proxies requests to downstream services via HTTP. It does not contain business logic—only cross-cutting concerns.

## Features

- **JWT Validation**: Validates tokens on protected routes; public routes (login, register, refresh, health) skip validation
- **Rate Limiting**: Global limit (100 req/min per IP); stricter limit on auth routes (10 req/min per IP)
- **Circuit Breaking**: Per-service circuit breakers with opossum; returns 503 when a service is unavailable
- **Request Proxying**: Forwards `/{service}/*` to downstream services; strips Authorization header; adds X-Correlation-ID and X-Forwarded-For
- **Health Checks**: `GET /health` and `GET /health/:service` for gateway and downstream status
- **Structured Logging**: All requests logged with correlationId, method, path, statusCode, durationMs, targetService, upstreamIp

## Running Locally

```bash
pnpm install
pnpm dev
```

## Environment Variables

| Variable             | Required | Default | Description                                                 |
| -------------------- | -------- | ------- | ----------------------------------------------------------- |
| `PORT`               | No       | 3000    | Port the gateway listens on                                 |
| `JWT_SECRET`         | Yes      | -       | Secret for validating JWTs (same as auth-service)           |
| `AUTH_SERVICE_URL`   | Yes      | -       | Base URL of the auth service (e.g. `http://localhost:3001`) |
| `REQUEST_TIMEOUT_MS` | No       | 10000   | Timeout for proxy requests in milliseconds                  |
| `RATE_LIMIT_TTL`     | No       | 60      | Rate limit window in seconds                                |
| `RATE_LIMIT_MAX`     | No       | 100     | Max requests per IP per window                              |

## API Endpoints

| Method | Path               | Description                                              |
| ------ | ------------------ | -------------------------------------------------------- |
| GET    | `/health`          | Gateway + all downstream services status                 |
| GET    | `/health/:service` | Single downstream service status + circuit breaker state |
| \*     | `/{service}/*`     | Proxied to downstream service                            |

## Adding a New Downstream Service

1. Add the service URL to `src/config/env.ts` (e.g. `USER_SERVICE_URL`)
2. Register the service in `CircuitBreakerModule.onModuleInit()` and `ProxyService.SERVICE_URL_MAP`
