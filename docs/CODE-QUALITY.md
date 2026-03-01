# Code Quality

**See also**: [ARCHITECTURE_GUIDELINES.md](./ARCHITECTURE_GUIDELINES.md) — navigation hub

---

## ESLint

### Configuration Hierarchy

1. **Base config** (`packages/eslint-config`): Core rules shared across all services
2. **Service config** (`.eslintrc.js` per service): Extends base, may add service-specific overrides

### Required Plugins

The base config in `packages/eslint-config` must include:

- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`
- `eslint-plugin-import`
- `eslint-plugin-node`
- `eslint-plugin-promise`
- `eslint-plugin-security`
- `eslint-config-prettier` (disables rules that conflict with Prettier)

### Service ESLint Config

```javascript
// apps/my-service/.eslintrc.js
module.exports = {
  extends: ['@repo/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // Service-specific overrides only if truly necessary
  },
};
```

### Rules Philosophy

- **Strict by default**: Enforce best practices across the board
- **TypeScript-first**: Leverage the type system to catch errors early
- **Security-conscious**: `eslint-plugin-security` catches common vulnerabilities
- **Import discipline**: Enforces the `@service-name/*` alias pattern (no relative imports)

---

## Prettier

### Configuration

All services extend the shared config from `packages/prettier-config`.

```javascript
// apps/my-service/.prettierrc.js
module.exports = require('@repo/prettier-config');
```

### Formatting Rules

| Rule | Value |
|---|---|
| Quotes | Single |
| Trailing commas | All |
| Indentation | 2 spaces |
| Print width | 100 |
| Semicolons | true |

---

## EditorConfig

A single `.editorconfig` at the root ensures consistent behavior across editors and IDEs:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

---

## Pre-Commit Hooks (Mandatory)

**Husky + lint-staged are required in all services.** This is not optional — commits must pass linting and formatting checks before being accepted.

### Setup

```bash
# Run once at the monorepo root
pnpm add -w husky lint-staged
pnpm exec husky init
```

### Configuration

Add to root `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yaml}": ["prettier --write"]
  }
}
```

---

## CI Pipeline

All CI pipelines **must** include these steps. The build must fail if any step does not pass.

```yaml
# Example: .github/workflows/quality.yml
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint        # Fails on ESLint errors
      - run: pnpm run format      # Fails on Prettier violations
      - run: pnpm run build       # Fails on TypeScript errors
      - run: pnpm run test        # Fails on test failures
```

---

## Testing

### Guidelines

- **Unit tests**: Test individual functions and modules in isolation
- **Integration tests**: Test service interactions and database behavior
- **E2E tests**: Test complete workflows (optional, in a separate package)
- **Coverage**: Maintain reasonable thresholds configured in `packages/vitest-config`

### Running Tests

```bash
# Run tests in all services
pnpm run test

# Run tests in a specific service
pnpm --filter <service-name> run test

# Run with coverage
pnpm --filter <service-name> run test:coverage
```

---

**Last Updated**: 2026-03-01  
**Version**: 1.1.0
