import { createEnv } from '@repo/env-config';
import { z } from 'zod';

export default createEnv({
  PORT: z.coerce.number().default(3003),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});
