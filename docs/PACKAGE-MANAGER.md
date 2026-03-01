# Package Manager

**See also**: [ARCHITECTURE_GUIDELINES.md](./ARCHITECTURE_GUIDELINES.md) — navigation hub

---

## pnpm

**pnpm** is the exclusive package manager for this monorepo. Do not use `npm` or `yarn`.

### Why pnpm?

- **Disk Efficiency**: Content-addressable storage reduces disk usage across projects
- **Strict Dependency Resolution**: Prevents phantom dependencies (packages you didn't explicitly install)
- **Fast Installation**: Parallel downloads and efficient caching
- **Workspace Support**: Native monorepo support via `pnpm-workspace.yaml`

---

## Workspace Configuration

The root `pnpm-workspace.yaml` defines which directories are part of the monorepo:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

## Common Commands

### Installation

```bash
# Install all dependencies across the monorepo
pnpm install

# Install with frozen lockfile (use in CI)
pnpm install --frozen-lockfile
```

### Adding Dependencies

```bash
# Add dependency to the monorepo root
pnpm add -w <package>

# Add dependency to a specific service
pnpm add --filter <service-name> <package>

# Add a dev dependency to a specific service
pnpm add --filter <service-name> -D <package>

# Add an internal shared package to a service
pnpm add --filter <service-name> @repo/shared-utils
```

### Running Scripts

```bash
# Run a script in all workspaces
pnpm run <script>

# Run a script in a specific service
pnpm --filter <service-name> run <script>

# Run a script in multiple specific services
pnpm --filter "{auth-service,user-service}" run <script>

# Run a script in all packages (not apps)
pnpm --filter "./packages/*" run <script>
```

### Auditing

```bash
# Check for known vulnerabilities
pnpm audit

# Fix vulnerabilities automatically where possible
pnpm audit --fix
```

---

## Internal Package References

Always use the workspace protocol when referencing internal packages. This ensures the local version is used during development instead of fetching from the registry.

```json
{
  "dependencies": {
    "@repo/shared-utils": "workspace:*",
    "@repo/tsconfig": "workspace:*"
  }
}
```

---

## Guidelines

- **Never commit `node_modules`** — it's covered by `.gitignore`
- **Always commit `pnpm-lock.yaml`** — it ensures reproducible installs across environments
- **Run `pnpm audit` regularly** — ideally as a scheduled CI job
- **Keep shared dep versions consistent** — if multiple services use `zod`, they should use the same version

---

**Last Updated**: 2026-03-01  
**Version**: 1.1.0
