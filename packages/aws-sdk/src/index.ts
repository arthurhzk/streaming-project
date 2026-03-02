import { DynamoDBClient, type DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';

export { DynamoDBClient } from '@aws-sdk/client-dynamodb';
export { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
export { S3Client } from '@aws-sdk/client-s3';

const DEFAULT_REGION = 'us-east-1';

export function createDynamoDBClient(
  config?: Partial<DynamoDBClientConfig>,
  location?: string,
): DynamoDBClient {
  return new DynamoDBClient({
    region: location ?? DEFAULT_REGION,
    ...config,
  });
}

export function createDynamoDBDocumentClient(client?: DynamoDBClient): DynamoDBDocumentClient {
  const baseClient = client ?? createDynamoDBClient();
  return DynamoDBDocumentClient.from(baseClient);
}

export function createS3Client(config?: Partial<S3ClientConfig>, location?: string): S3Client {
  return new S3Client({
    region: location ?? DEFAULT_REGION,
    ...config,
  });
}
