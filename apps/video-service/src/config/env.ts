import { createEnv } from '@repo/env-config';
import { z } from 'zod';

export default createEnv({
  PORT: z.coerce.number().default(3002),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),
  DYNAMODB_TABLE_NAME: z.string(),
});
