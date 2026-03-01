import { z } from 'zod';
import { commonSchema } from '@repo/env-config/common';

export function createEnv<T extends Record<string, z.ZodTypeAny>>(
  schema: T,
): z.output<z.ZodObject<{ [K in keyof typeof commonSchema]: (typeof commonSchema)[K] } & T>> {
  const merged = z.object({
    ...commonSchema,
    ...schema,
  });
  return merged.parse(process.env) as z.output<typeof merged>;
}
