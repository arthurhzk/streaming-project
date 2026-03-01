# TypeScript Configuration

**See also**: [ARCHITECTURE_GUIDELINES.md](./ARCHITECTURE_GUIDELINES.md) — navigation hub

---

## Configuration Structure

Each service extends the shared TypeScript configuration from `packages/tsconfig`.

```
packages/tsconfig/
├── base.json       # Common compiler options for all projects
└── node.json       # Node.js-specific settings (extends base.json)
```

### Service `tsconfig.json`

```json
{
  "extends": "@repo/tsconfig/node.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./src",
    "paths": {
      "@service-name/*": ["./*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## Compiler Options

### Strict Mode (Mandatory)

All services must have strict TypeScript enabled. These settings are enforced in `base.json` and must not be overridden:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### Target & Module

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

> **Note**: `NodeNext` is the recommended setting for NestJS and native Node.js projects, as it provides correct ESM/CJS interop without a bundler. If your service uses a bundler (esbuild, webpack), `module: ESNext` with `moduleResolution: bundler` is also acceptable.

---

## Import Aliases

### CRITICAL RULE

**Always use the `@service-name/*` alias pattern. Relative imports (`./` or `../`) are strictly forbidden inside a service.**

This rule is enforced by ESLint and will fail in CI.

### Setup

In your service `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@auth-service/*": ["./*"]
    }
  }
}
```

### Usage

```typescript
// ❌ NEVER — relative imports are forbidden
import { AppModule } from './app.module';
import { AuthModule } from '../modules/auth/auth.module';
import { validateToken } from '../../../utils/auth';

// ✅ ALWAYS — use alias imports
import { AppModule } from '@auth-service/app.module';
import { AuthModule } from '@auth-service/modules/auth/auth.module';
import { validateToken } from '@auth-service/utils/auth';
```

### Rules

1. **Mandatory**: All intra-service imports must use the `@` alias
2. **Service-scoped**: Each alias only resolves within its own service
3. **No cross-service aliases**: To import from another service, use its package name
4. **Naming**: The alias must match the service's directory name in kebab-case

### Cross-Service Imports

```typescript
// Importing from a shared package
import { sharedUtil } from '@repo/shared-utils';

// Importing from another service exposed as a package
import { authHelper } from '@repo/auth-service';
```

> Cross-service imports should be minimized. Prefer shared packages in `packages/` or runtime API communication instead.

---

## Type Definitions

- **Shared types** used across multiple services → `packages/shared-types`
- **Service-specific types** → `src/types/` inside each service
- **External library types** → install the corresponding `@types/*` package

---

**Last Updated**: 2026-03-01  
**Version**: 1.1.0
