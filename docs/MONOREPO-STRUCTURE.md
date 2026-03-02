# Monorepo Structure

**See also**: [ARCHITECTURE_GUIDELINES.md](./ARCHITECTURE_GUIDELINES.md) — navigation hub

---

## Top-Level Layout

```
.
├── apps/                        # Deployable services
│   ├── service-name-1/
│   ├── service-name-2/
│   └── ...
├── packages/                    # Shared configs and libraries
│   ├── eslint-config/
│   ├── prettier-config/
│   ├── tsconfig/
│   ├── vitest-config/
│   ├── shared-utils/
│   └── ...
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .editorconfig
├── .gitignore
└── ARCHITECTURE_GUIDELINES.md
```

---

## Services (`apps/`)

Each service follows the pattern: `apps/{service-name}/`

### Service Structure

```
apps/
└── service-name/
    ├── src/
    │   ├── index.ts              # Entry point
    │   ├── routes/               # API routes (if applicable)
    │   ├── controllers/          # Request handlers
    │   ├── services/             # Business logic
    │   ├── models/               # Data models
    │   ├── middleware/           # Express/HTTP middleware
    │   ├── utils/                # Service-specific utilities
    │   └── types/                # TypeScript type definitions
    ├── tests/                    # Test files
    ├── package.json
    ├── tsconfig.json             # Extends packages/tsconfig/node.json
    ├── .eslintrc.js              # Extends packages/eslint-config
    ├── .prettierrc.js            # Extends packages/prettier-config
    └── vitest.config.ts          # Extends packages/vitest-config
```

---

## Packages (`packages/`)

Shared packages follow the pattern: `packages/{package-name}/`

### Package Structure

```
packages/
├── eslint-config/
│   ├── index.js
│   └── package.json
├── prettier-config/
│   ├── index.js
│   └── package.json
├── tsconfig/
│   ├── base.json
│   ├── node.json
│   └── package.json
├── vitest-config/
│   ├── index.ts
│   └── package.json
└── shared-utils/
    ├── src/
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

### Required Packages

| Package           | Purpose                                                     |
| ----------------- | ----------------------------------------------------------- |
| `eslint-config`   | Centralized ESLint rules for all services                   |
| `prettier-config` | Centralized Prettier formatting rules                       |
| `tsconfig`        | Shared TypeScript configurations (`base.json`, `node.json`) |
| `vitest-config`   | Centralized Vitest test setup and coverage config           |
| `shared-utils`    | Reusable utilities shared across services                   |
| `rabbitmq`        | NestJS RabbitMQ module for async messaging                  |
| `amqplib`         | Thin wrapper re-exporting amqplib; centralizes dependency   |
| `aws-sdk`         | DynamoDB and S3 client factories; centralizes AWS SDK v3    |

### Adding New Shared Packages

1. Create directory: `packages/{package-name}/`
2. Initialize `package.json` with name: `@repo/{package-name}`
3. Export your configuration or library code
4. Reference it in services using the workspace protocol:

```json
{
  "dependencies": {
    "@repo/package-name": "workspace:*"
  }
}
```

---

## Naming Conventions

| Scope                    | Convention          | Examples                        |
| ------------------------ | ------------------- | ------------------------------- |
| Service directories      | kebab-case          | `auth-service`, `user-service`  |
| Package directories      | kebab-case          | `shared-utils`, `eslint-config` |
| Source files (utilities) | kebab-case          | `token-validator.ts`            |
| Source files (classes)   | PascalCase          | `AuthController.ts`             |
| Import aliases           | `@{service-name}/*` | `@auth-service/utils/token`     |

---

## Guidelines

- **Keep directories shallow**: max 3–4 levels of nesting inside `src/`
- **Barrel exports**: use `index.ts` files at directory boundaries for clean imports
- **Avoid deep coupling**: if two services share logic, extract it to `packages/`
- **One responsibility per package**: packages should do one thing well

---

**Last Updated**: 2026-03-01  
**Version**: 1.1.0
