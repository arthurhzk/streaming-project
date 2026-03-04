import { createEnv } from '@repo/env-config';
import { z } from 'zod';

export default createEnv({
  PORT: z.coerce.number().default(3010),
  AWS_REGION: z.string().default('ap-southeast-2'),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),
  CLOUDFRONT_URL: z.string().url(),
  VIDEO_SERVICE_URL: z.string().url(),
  PRESIGNED_URL_EXPIRES_IN: z.coerce.number().default(900),
});
