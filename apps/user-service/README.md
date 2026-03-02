# user-service

Manages user profiles. Does not handle authentication — that is auth-service's responsibility. Consumes RabbitMQ events from auth-service to create and sync profiles.

## Run locally

```bash
pnpm dev
```

## Environment variables

| Variable     | Description                                                                                                                                                                                                     | Default  |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| PORT         | HTTP server port                                                                                                                                                                                                | 3002     |
| DATABASE_URL | MongoDB connection string (must include `replicaSet=rs0` and `authSource=admin` for Prisma transactions). Example: `mongodb://user_admin:user_password@localhost:27017/user_db?authSource=admin&replicaSet=rs0` | required |
| RABBITMQ_URL | RabbitMQ connection string                                                                                                                                                                                      | required |

## API endpoints

All routes require `X-User-Id` header (injected by api-gateway after JWT validation). Never validate JWT here — trust the gateway.

| Method | Path      | Description                     |
| ------ | --------- | ------------------------------- |
| GET    | /users/me | Return profile by X-User-Id     |
| PATCH  | /users/me | Update firstName, lastName, bio |
| DELETE | /users/me | Soft delete (status = DELETED)  |

## RabbitMQ events

**Consumed:**

- `user.created` — payload: `{ userId, email, firstName?, lastName? }` — creates Profile

**Published:**

- `user.deleted` — payload: `{ userId, email }` — when DELETE /users/me is called
