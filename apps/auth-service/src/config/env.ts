import { createEnv } from '@repo/env-config';
import { z } from 'zod';

export default createEnv({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('7d'),
});
