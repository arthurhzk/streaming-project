# Streaming Platform

A full-stack streaming platform built with a microservices architecture. This project demonstrates scalable backend design, cloud integration, and modern frontend development.

## Tech Stack

| Layer              | Technologies                                                    |
| ------------------ | --------------------------------------------------------------- |
| **Frontend**       | React 19, Vite, TypeScript, Tailwind CSS, React Query, Radix UI |
| **Backend**        | NestJS, TypeScript                                              |
| **Infrastructure** | pnpm, Turborepo (monorepo)                                      |
| **Databases**      | PostgreSQL (Prisma), DynamoDB                                   |
| **Cloud**          | AWS S3, AWS DynamoDB                                            |
| **Messaging**      | RabbitMQ                                                        |
| **Quality**        | ESLint, Prettier, Vitest, Husky                                 |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Web App   │────▶│ API Gateway  │────▶│ Auth Service    │
│  (React)    │     │  (NestJS)    │     │ (JWT, bcrypt)   │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │              ┌─────────────────┐
                           ├─────────────▶│ User Service    │
                           │              └─────────────────┘
                           │              ┌─────────────────┐
                           ├─────────────▶│ Video Service   │
                           │              │ (S3, DynamoDB)  │
                           │              └─────────────────┘
                           │              ┌─────────────────┐
                           └─────────────▶│ Notification    │
                                          │ (RabbitMQ)      │
                                          └─────────────────┘
```

- **API Gateway**: Single entry point, JWT validation, rate limiting, circuit breaker, security headers (Helmet)
- **Auth Service**: User authentication, JWT issuance, PostgreSQL + Prisma
- **User Service**: User management, event-driven via RabbitMQ
- **Video Service**: Video upload to S3, metadata in DynamoDB
- **Notification Service**: Email notifications via RabbitMQ consumers

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- Docker (for PostgreSQL, RabbitMQ)

### Install & Run

```bash
# Install dependencies
pnpm install

# Run all services in development
pnpm dev
```

### Available Scripts

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `pnpm dev`          | Start all services in dev mode |
| `pnpm build`        | Build all packages             |
| `pnpm lint`         | Lint all packages              |
| `pnpm test`         | Run tests                      |
| `pnpm format:write` | Format code with Prettier      |

### Environment

Each app has its own `.env` file. Copy `.env.example` (if available) and configure:

- **API Gateway**: `PORT`, `CORS_ORIGIN`, service URLs, JWT secret
- **Auth Service**: Database URL, JWT secret, RabbitMQ
- **Video Service**: AWS credentials, S3 bucket, DynamoDB table
- **Notification Service**: SMTP config, RabbitMQ

## Project Structure

```
streaming-project/
├── apps/
│   ├── api-gateway/      # API Gateway (NestJS)
│   ├── auth-service/    # Authentication (NestJS, Prisma)
│   ├── user-service/    # User management (NestJS, Prisma)
│   ├── video-service/   # Video upload & metadata (NestJS, S3, DynamoDB)
│   ├── notification-service/  # Email notifications (NestJS, RabbitMQ)
│   └── web/             # React frontend (Vite)
├── packages/
│   ├── aws-sdk/         # Shared AWS client config
│   ├── amqplib/        # RabbitMQ client
│   ├── logger/         # Structured logging
│   ├── env-config/     # Environment validation
│   ├── eslint-config/  # Shared ESLint
│   ├── prettier-config/
│   ├── tsconfig/       # Shared TypeScript config
│   └── vitest-config/  # Shared test config
└── turbo.json
```

## Highlights

- **Monorepo**: Shared packages, consistent tooling, Turborepo for caching
- **Microservices**: Each service owns its database; no cross-DB queries
- **Event-driven**: RabbitMQ for async communication between services
- **Cloud-native**: AWS S3 for storage, DynamoDB for scalable metadata
- **Production-ready patterns**: Circuit breaker, rate limiting, validation (Zod), structured logging
