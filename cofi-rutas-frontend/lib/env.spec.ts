import { describe, it, expect } from 'vitest';
import { envSchema } from './env';

describe('Frontend envSchema validation', () => {
  it('should accept valid frontend environment variables', () => {
    const valid = {
      NODE_ENV: 'test',
      NEXT_PUBLIC_API_URL: 'http://localhost:3001/api/v1',
    };

    const parsed = envSchema.parse(valid);
    expect(parsed.NODE_ENV).toBe('test');
    expect(parsed.NEXT_PUBLIC_API_URL).toBe('http://localhost:3001/api/v1');
  });

  it('should reject invalid URL for NEXT_PUBLIC_API_URL', () => {
    const invalid = {
      NEXT_PUBLIC_API_URL: 'not-a-valid-url',
    };

    expect(() => envSchema.parse(invalid)).toThrow();
  });
});
