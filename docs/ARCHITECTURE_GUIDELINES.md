# Architecture Guidelines

> Navigation hub — read this first to understand the overall architecture and find the right document for your task.

## Quick Reference (For LLMs)

- ✅ DO: Use this doc to navigate to specific guidelines based on task type
- ✅ DO: Load specific docs only when needed (progressive loading)
- ❌ DON'T: Load all docs at once (saves ~40k tokens)
- ❌ DON'T: Skip this when starting new work

---

## Overview

This monorepo follows a **Turborepo** architecture pattern, enabling efficient development, testing, and deployment of multiple services while maintaining code quality, consistency, and scalability.

### Key Principles

- **Centralized Configuration**: Shared tooling and configurations live in `packages/`
- **Service Isolation**: Each service is self-contained with clear boundaries
- **Consistent Standards**: Uniform code quality, formatting, and TypeScript configuration
- **Scalable Structure**: Easy to add new services without disrupting existing ones
- **Developer Experience**: Fast builds, clear conventions, and comprehensive documentation

---

## Document Map

| Document                                             | Responsibility                           | When to Read                             |
| ---------------------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| [MONOREPO-STRUCTURE.md](./MONOREPO-STRUCTURE.md)     | Folder layout, naming conventions        | Creating or navigating services/packages |
| [PACKAGE-MANAGER.md](./PACKAGE-MANAGER.md)           | pnpm setup and commands                  | Installing deps, workspace management    |
| [TYPESCRIPT-CONFIG.md](./TYPESCRIPT-CONFIG.md)       | tsconfig, strict mode, import aliases    | Any TypeScript work                      |
| [CODE-QUALITY.md](./CODE-QUALITY.md)                 | ESLint, Prettier, Husky, CI              | Setting up linting or pre-commit hooks   |
| [SERVICE-BOUNDARIES.md](./SERVICE-BOUNDARIES.md)     | Isolation, HTTP communication, databases | Designing inter-service communication    |
| [DEVELOPMENT-WORKFLOW.md](./DEVELOPMENT-WORKFLOW.md) | Turborepo, builds, caching               | Running and building the project         |
| [ADDING-NEW-SERVICES.md](./ADDING-NEW-SERVICES.md)   | Step-by-step service creation checklist  | Creating a new service from scratch      |
| [PRISMA-CONFIG.md](./PRISMA-CONFIG.md)               | Prisma setup, migrations, connection     | Working with databases or Prisma         |

---

## Decision Tree

**IF** setting up a new service from scratch → read [ADDING-NEW-SERVICES.md](./ADDING-NEW-SERVICES.md)  
**IF** working with TypeScript configs or import aliases → read [TYPESCRIPT-CONFIG.md](./TYPESCRIPT-CONFIG.md)  
**IF** setting up linting, formatting, or CI → read [CODE-QUALITY.md](./CODE-QUALITY.md)  
**IF** designing how services communicate → read [SERVICE-BOUNDARIES.md](./SERVICE-BOUNDARIES.md)  
**IF** running builds or understanding Turborepo → read [DEVELOPMENT-WORKFLOW.md](./DEVELOPMENT-WORKFLOW.md)  
**IF** understanding folder structure or naming → read [MONOREPO-STRUCTURE.md](./MONOREPO-STRUCTURE.md)  
**IF** managing dependencies or pnpm commands → read [PACKAGE-MANAGER.md](./PACKAGE-MANAGER.md)  
**IF** working with databases or Prisma → read [PRISMA-CONFIG.md](./PRISMA-CONFIG.md)  
**IF** a service needs async messaging → read [packages/rabbitmq/README.md](../packages/rabbitmq/README.md)

---

## Common Pitfalls

🚫 **Most Critical Violations**:

1. **Relative imports** — Never use `./` or `../`. Always use `@service-name/*` aliases → [TYPESCRIPT-CONFIG.md](./TYPESCRIPT-CONFIG.md)
2. **Wrong turbo.json syntax** — Use `"tasks"`, not `"pipeline"` (Turborepo v2+) → [DEVELOPMENT-WORKFLOW.md](./DEVELOPMENT-WORKFLOW.md)
3. **Skipping pre-commit hooks** — Husky + lint-staged are mandatory, not optional → [CODE-QUALITY.md](./CODE-QUALITY.md)
4. **Hardcoded service URLs** — Always use environment variables for inter-service communication → [SERVICE-BOUNDARIES.md](./SERVICE-BOUNDARIES.md)
5. **Cross-database access** — Services must never query another service's database → [SERVICE-BOUNDARIES.md](./SERVICE-BOUNDARIES.md)
6. **Prisma: wrong client import** — Import `PrismaClient` from `@service-name/generated/prisma/client`, not `@prisma/client` → [PRISMA-CONFIG.md](./PRISMA-CONFIG.md)
7. **Prisma: missing driver adapter** — Use `PrismaPg` from `@prisma/adapter-pg` with connection string; do not pass URL directly to `PrismaClient` → [PRISMA-CONFIG.md](./PRISMA-CONFIG.md)

---

## For New Team Members

1. Read this overview (you're here!)
2. Read [MONOREPO-STRUCTURE.md](./MONOREPO-STRUCTURE.md) to understand the folder layout
3. Read [TYPESCRIPT-CONFIG.md](./TYPESCRIPT-CONFIG.md) — especially the import alias rules
4. Read [CODE-QUALITY.md](./CODE-QUALITY.md) to set up your local environment
5. Use [ADDING-NEW-SERVICES.md](./ADDING-NEW-SERVICES.md) when creating your first service

---

**Last Updated**: 2026-03-01  
**Version**: 1.1.0
