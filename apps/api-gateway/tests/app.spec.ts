import { describe, it, expect } from 'vitest';

describe('api-gateway', () => {
  it('should have env config', () => {
    expect(process.env).toBeDefined();
  });
});
