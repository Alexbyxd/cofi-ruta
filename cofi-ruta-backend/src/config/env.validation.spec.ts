import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('should validate valid environment configuration', () => {
    const validConfig = {
      NODE_ENV: 'test',
      BACKEND_PORT: '3001',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      FRONTEND_URL: 'http://localhost:3000',
      JWT_ACCESS_SECRET: 'supersecretaccess',
      JWT_REFRESH_SECRET: 'supersecretrefresh',
    };

    const parsed = validateEnv(validConfig);
    expect(parsed.NODE_ENV).toBe('test');
    expect(parsed.BACKEND_PORT).toBe(3001);
  });

  it('should throw an error when required variables are missing', () => {
    const invalidConfig = {
      NODE_ENV: 'development',
    };

    expect(() => validateEnv(invalidConfig)).toThrow(
      'Environment variable validation failed',
    );
  });
});
