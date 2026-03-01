# Prisma Configuration

> Reference implementation: `apps/auth-service`. Document only what exists there.

---

## Dependencies and Versions

| Package              | Version | Purpose                                            |
| -------------------- | ------- | -------------------------------------------------- |
| `prisma`             | ^7.4.2  | devDependency — CLI for generate, migrate, studio  |
| `@prisma/client`     | ^7.4.2  | Runtime client                                     |
| `@prisma/adapter-pg` | ^7.4.2  | PostgreSQL driver adapter (required for Prisma 7+) |
| `pg`                 | ^8.13.1 | PostgreSQL driver (peer of adapter)                |

**Critical**: All Prisma-related packages must use the same major.minor version.

---

## Required Scripts

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "postinstall": "prisma generate"
  }
}
```

- `prisma:generate` — Run manually when schema changes.
- `postinstall` — Ensures client is generated after `pnpm install`.

**Note**: auth-service does not define `prisma:migrate` or `prisma:studio` scripts. Run those via `pnpm exec prisma migrate` or `pnpm exec prisma studio` from the service directory.

---

## schema.prisma Structure

### Generator

```prisma
generator client {
  provider               = "prisma-client"
  output                 = "../src/generated/prisma"
  moduleFormat           = "cjs"
  importFileExtension    = "ts"
}
```

- `output` — Client generated under `src/generated/prisma` (not `node_modules`).
- `importFileExtension` — Use `.ts` for TypeScript imports.

### Datasource

```prisma
datasource db {
  provider = "postgresql"
}
```

- **No `url` in schema** — Connection URL is set in `prisma.config.ts` (see below).

### Naming Conventions

- Model names: PascalCase (e.g. `User`).
- Table names: `@@map("snake_case")` (e.g. `@@map("users")`).
- Model fields: camelCase.

---

## prisma.config.ts

Prisma 7+ uses a config file for datasource URL:

```ts
/// <reference types="node" />
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/auth',
  },
});
```

- `dotenv/config` — Loads `.env` before `process.env` is read.
- Fallback URL — `postgresql://localhost:5432/auth` when `DATABASE_URL` is unset.

---

## Database Connection Setup

### 1. Environment validation

`src/config/env.ts` uses `@repo/env-config` and Zod:

```ts
export default createEnv({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  // ...
});
```

- `DATABASE_URL` is required and validated as URL.

### 2. PrismaService (NestJS)

```ts
import { PrismaClient } from '@auth-service/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import env from '@auth-service/config/env';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: env.DATABASE_URL,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

- `PrismaClient` is imported from `@auth-service/generated/prisma/client`, not `@prisma/client`.
- Uses `PrismaPg` driver adapter — connection string must be passed to the adapter, not `PrismaClient` directly.
- `PrismaModule` provides and exports `PrismaService`.

---

## Migration Workflow

### Creating a migration

From the service directory:

```bash
pnpm exec prisma migrate dev --name add_something
```

Or from monorepo root:

```bash
pnpm --filter auth-service exec prisma migrate dev --name add_something
```

### Running migrations

```bash
pnpm exec prisma migrate deploy
```

### Migration lock

`prisma/migrations/migration_lock.toml`:

```toml
provider = "postgresql"
```

- Commit this file with migrations.

---

## Service Isolation Patterns

1. **One schema per service** — Each service has its own `prisma/schema.prisma`.
2. **One database per service** — Each service has its own `DATABASE_URL` (e.g. `auth_db`).
3. **Generated client in service** — Output lives under `src/generated/prisma` and is imported via `@service-name/generated/prisma/client`.
4. **PrismaModule** — NestJS module that provides `PrismaService`; import it where needed.

---

## Common Mistakes to Avoid

1. **Importing from `@prisma/client`** — Use `@service-name/generated/prisma/client` for `PrismaClient`.
2. **Passing connection string to `PrismaClient`** — Use `PrismaPg` adapter and pass `connectionString` to the adapter.
3. **Putting `url` in `datasource`** — auth-service uses `prisma.config.ts` for the URL.
4. **Version mismatch** — Keep `prisma`, `@prisma/client`, and `@prisma/adapter-pg` on the same version.
5. **Skipping `prisma generate`** — Run after schema changes or install; `postinstall` handles install.
6. **Cross-database access** — Never query another service’s database from the client.
