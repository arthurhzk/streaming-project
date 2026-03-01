# Adding New Services

**See also**: [ARCHITECTURE_GUIDELINES.md](./ARCHITECTURE_GUIDELINES.md) — navigation hub

---

## Before You Start

Read these documents first if you haven't already:

- [MONOREPO-STRUCTURE.md](./MONOREPO-STRUCTURE.md) — understand where things go
- [TYPESCRIPT-CONFIG.md](./TYPESCRIPT-CONFIG.md) — especially the import alias rules
- [CODE-QUALITY.md](./CODE-QUALITY.md) — ESLint, Prettier, and Husky setup
- [SERVICE-BOUNDARIES.md](./SERVICE-BOUNDARIES.md) — how services communicate

---

## Step-by-Step Checklist

### 1. Create the Service Directory

```bash
mkdir -p apps/my-service/src/{routes,controllers,services,models,middleware,utils,types}
mkdir -p apps/my-service/tests
```

### 2. Initialize `package.json`

```json
{
  "name": "my-service",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {},
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/prettier-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "@repo/vitest-config": "workspace:*"
  }
}
```

### 3. Configure TypeScript

```json
// apps/my-service/tsconfig.json
{
  "extends": "@repo/tsconfig/node.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./src",
    "paths": {
      "@my-service/*": ["./*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 4. Configure ESLint

```javascript
// apps/my-service/.eslintrc.js
module.exports = {
  extends: ['@repo/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
  },
};
```

### 5. Configure Prettier

```javascript
// apps/my-service/.prettierrc.js
module.exports = require('@repo/prettier-config');
```

### 6. Configure Vitest

```typescript
// apps/my-service/vitest.config.ts
import { defineConfig } from 'vitest/config';
import baseConfig from '@repo/vitest-config';

export default defineConfig({
  ...baseConfig,
  resolve: {
    alias: {
      '@my-service': './src',
    },
  },
});
```

### 7. Create the Entry Point

```typescript
// apps/my-service/src/index.ts
import env from '@my-service/config/env';

async function bootstrap() {
  // Initialize your app here
  console.log(`Service starting on port ${env.PORT}`);
}

bootstrap().catch(console.error);
```

### 8. Add Environment Validation

```typescript
// apps/my-service/src/config/env.ts
import { z } from 'zod';

const env = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
}).parse(process.env);

export default env;
```

### 9. Add a README

Each service must have a `README.md` at its root explaining:

- What the service does
- How to run it locally
- Required environment variables
- API endpoints (or link to OpenAPI spec)

### 10. Install Dependencies

```bash
pnpm install
```

---

## Verification Checklist

Before opening a PR for a new service, confirm:

- [ ] Service directory follows kebab-case naming (`apps/my-service/`)
- [ ] `tsconfig.json` extends `@repo/tsconfig/node.json`
- [ ] Import alias `@my-service/*` is configured in `tsconfig.json`
- [ ] **Zero relative imports** — all imports use `@my-service/*`
- [ ] ESLint config extends `@repo/eslint-config`
- [ ] Prettier config extends `@repo/prettier-config`
- [ ] `pnpm run lint` passes with no errors
- [ ] `pnpm run build` passes with no errors
- [ ] `pnpm run test` passes
- [ ] Environment variables are validated at startup with `zod` or equivalent
- [ ] No hardcoded service URLs — all resolved from `process.env`
- [ ] `README.md` exists with setup instructions

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Using `../` in imports | Replace with `@my-service/*` alias |
| Copying `tsconfig.json` without updating `paths` | Update `@my-service/*` to match your service name |
| Hardcoding database URLs | Use `process.env.DATABASE_URL` |
| Forgetting to run `pnpm install` | Run it after creating `package.json` |
| Service name doesn't match alias | Directory name and alias must match exactly |

---

**Last Updated**: 2026-03-01  
**Version**: 1.1.0
