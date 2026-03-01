# auth-service

Authentication service built with NestJS, Prisma, and PostgreSQL.

## Running locally

1. Install dependencies from the monorepo root:

   ```bash
   pnpm install
   ```

2. Generate the Prisma client:

   ```bash
   pnpm --filter auth-service run prisma:generate
   ```

3. Set the required environment variables (see below).

4. Start the service:

   ```bash
   pnpm --filter auth-service run dev
   ```

## Environment variables

| Variable         | Required | Default | Description                   |
| ---------------- | -------- | ------- | ----------------------------- |
| `DATABASE_URL`   | Yes      | -       | PostgreSQL connection string  |
| `JWT_SECRET`     | Yes      | -       | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | No       | `7d`    | JWT expiration (e.g. `7d`)    |
| `PORT`           | No       | `3001`  | HTTP server port              |

## API endpoints

TBD
