# Service Boundaries

**See also**: [ARCHITECTURE_GUIDELINES.md](./ARCHITECTURE_GUIDELINES.md) — navigation hub

---

## Isolation Principles

Each service must be self-contained. The core rules are:

1. **Independent deployment**: A service can be built and deployed without touching others
2. **Separate dependencies**: Each service manages its own runtime dependencies
3. **Clear APIs**: Services communicate only via well-defined interfaces
4. **No cross-database access**: Services must never query another service's database directly

---

## Communication Patterns

### 1. Shared Packages (Compile-time)

For types and utilities shared between services, use packages in `packages/`:

```typescript
// packages/shared-types/src/index.ts
export interface User {
  id: string;
  email: string;
}

// In any service
import { User } from '@repo/shared-types';
```

### 2. HTTP/REST APIs (Runtime)

For runtime communication between services, use HTTP. Service URLs must always be resolved via **environment variables** — never hardcode addresses.

```typescript
// config/services.ts
export const SERVICE_URLS = {
  auth: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001',
  user: process.env.USER_SERVICE_URL ?? 'http://localhost:3002',
} as const;

// Calling another service
const response = await fetch(`${SERVICE_URLS.auth}/validate-token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token }),
});

if (!response.ok) {
  throw new Error(`Auth service responded with ${response.status}`);
}
```

**Best practices for HTTP communication**:

- Define API contracts using OpenAPI/Swagger
- Handle non-2xx responses explicitly
- Implement retries with exponential backoff for transient failures
- Use circuit breakers for services that are called frequently

### 3. Message Queues (Async, Optional)

For async, fire-and-forget or event-driven communication:

- Use a message broker (RabbitMQ, Kafka, etc.)
- Define message schemas explicitly (avoid `any`)
- Handle consumer failures gracefully with dead-letter queues
- Document which services produce and consume each event

---

## Database Boundaries

| Rule                             | Reason                                                                    |
| -------------------------------- | ------------------------------------------------------------------------- |
| One database per service         | Enforces true isolation and independent deployability                     |
| No cross-database queries        | Prevents tight coupling at the data layer                                 |
| No shared ORM models             | Each service defines its own entities                                     |
| Shared data access (last resort) | If unavoidable, create a dedicated shared package with explicit ownership |

> **If you find yourself needing to query another service's database**, that's a signal that either the service boundary is wrong, or the data should be exposed via an API or shared event.

---

## Environment Variables

All configurable values — including service URLs, ports, database connections, and secrets — must come from environment variables.

```typescript
// ✅ Correct
const dbUrl = process.env.DATABASE_URL;
const authServiceUrl = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';

// ❌ Never hardcode
const dbUrl = 'postgresql://localhost:5432/mydb';
const authServiceUrl = 'http://auth-service:3001';
```

Use a validation library (e.g., `zod`, `envalid`) to validate required environment variables at startup, so the service fails fast with a clear error instead of crashing at runtime.

```typescript
import { z } from 'zod';

const env = z
  .object({
    DATABASE_URL: z.string().url(),
    AUTH_SERVICE_URL: z.string().url(),
    PORT: z.coerce.number().default(3000),
  })
  .parse(process.env);

export default env;
```

---

**Last Updated**: 2026-03-01  
**Version**: 1.1.0
