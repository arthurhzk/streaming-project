# @repo/aws-sdk

Shared AWS SDK v3 client setup for DynamoDB and S3. Centralizes client configuration and provides factory functions that use `AWS_REGION` from the environment.

## Installation

Add to your service's `package.json`:

```json
{
  "dependencies": {
    "@repo/aws-sdk": "workspace:*"
  }
}
```

Then run `pnpm install`.

## Environment Variables

| Variable     | Description                  | Default     |
| ------------ | ---------------------------- | ----------- |
| `AWS_REGION` | AWS region for client config | `us-east-1` |

Credentials use the default chain (env vars, IAM role, `~/.aws/credentials`).

## Usage

### DynamoDB

```typescript
import { createDynamoDBClient, createDynamoDBDocumentClient, DynamoDBClient } from '@repo/aws-sdk';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';

// Low-level client (raw AttributeValue API)
const client = createDynamoDBClient();
const result = await client.send(
  new GetItemCommand({
    TableName: 'videos',
    Key: { id: { S: '123' } },
  }),
);

// Document client (simplified JavaScript object API)
const docClient = createDynamoDBDocumentClient();
import { GetCommand } from '@aws-sdk/lib-dynamodb';
const docResult = await docClient.send(
  new GetCommand({
    TableName: 'videos',
    Key: { id: '123' },
  }),
);
```

### S3

```typescript
import { createS3Client } from '@repo/aws-sdk';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = createS3Client();
await s3.send(
  new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: 'path/to/file',
    Body: buffer,
  }),
);
```

### Custom Configuration

Factory functions accept optional config overrides:

```typescript
const client = createDynamoDBClient({ region: 'eu-west-1' });
const s3 = createS3Client({ endpoint: 'https://custom-endpoint' });
```

## Exports

- `DynamoDBClient`, `DynamoDBDocumentClient`, `S3Client` — client classes
- `createDynamoDBClient()` — factory for DynamoDB client
- `createDynamoDBDocumentClient(client?)` — factory for Document client
- `createS3Client()` — factory for S3 client

Import commands from `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, or `@aws-sdk/client-s3` as needed (they are transitive dependencies of this package).
