# Development Workflow

**See also**: [ARCHITECTURE_GUIDELINES.md](./ARCHITECTURE_GUIDELINES.md) — navigation hub

---

## Starting Development

```bash
# Install all dependencies across the monorepo
pnpm install

# Start all services in development mode
pnpm run dev

# Start a specific service only
pnpm --filter <service-name> run dev
```

---

## Turborepo

This monorepo uses **Turborepo** to orchestrate builds, tests, and other tasks efficiently across all services.

### Key Concepts

- **Task pipeline**: Tasks can declare dependencies (e.g., `build` depends on `^build` — meaning all upstream packages must build first)
- **Caching**: Turborepo caches task outputs. If inputs haven't changed, the cached result is used instead of re-running
- **Parallelism**: Independent tasks run in parallel automatically
- **Remote cache**: Optionally share cache across the team or CI (requires configuration)

### `turbo.json`

> ⚠️ **Important**: Turborepo v2+ requires `"tasks"` instead of the legacy `"pipeline"` key. Always use `"tasks"`.

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "format": {
      "cache": false
    }
  }
}
```

---

## Running Commands

```bash
# Run a script in all workspaces
pnpm run <script>

# Run a script in a specific service
pnpm --filter <service-name> run <script>

# Run a script in multiple services
pnpm --filter "{service-1,service-2}" run <script>

# Run a script in all packages only
pnpm --filter "./packages/*" run <script>
```

---

## Build Caching

| Scenario | Behavior |
|---|---|
| Inputs unchanged | Cache hit — task is skipped |
| Inputs changed | Cache miss — task runs and result is stored |
| Remote cache enabled | Cache shared across all team members and CI |

To clear the local cache:

```bash
pnpm exec turbo daemon clean
```

---

## CI/CD Pipeline

All pipelines must include these steps. **The build fails if any step does not pass.**

```yaml
# Example: .github/workflows/ci.yml
jobs:
  ci:
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

For faster CI runs, enable Turborepo remote caching to reuse results from previous pipeline runs.

---

## Best Practices

- **Always run `pnpm install` after pulling** — lockfile may have changed
- **Don't bypass pre-commit hooks** — they exist to catch issues early
- **Check Turborepo cache hits** — if builds are slow, investigate why cache is missing
- **Use `--filter` for faster feedback** — run only the service you're working on during development

---

**Last Updated**: 2026-03-01  
**Version**: 1.1.0
