import { createEnv } from '@repo/env-config';
import { z } from 'zod';

export default createEnv({
  PORT: z.coerce.number().default(3002),
  DATABASE_URL: z.string().url(),
  RABBITMQ_URL: z.string().url(),
});
