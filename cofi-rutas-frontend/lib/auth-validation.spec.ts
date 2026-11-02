import { describe, it, expect } from 'vitest';
import { loginFormSchema, registerFormSchema } from './auth-validation';

describe('Frontend Auth Validation Schemas', () => {
  describe('loginFormSchema', () => {
    it('should validate valid email and password', () => {
      const result = loginFormSchema.safeParse({
        email: 'user@cofi.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginFormSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password with less than 6 chars', () => {
      const result = loginFormSchema.safeParse({
        email: 'user@cofi.com',
        password: '123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerFormSchema', () => {
    it('should validate valid register payload', () => {
      const result = registerFormSchema.safeParse({
        fullName: 'Carlos Sanchez',
        email: 'carlos@cofi.com',
        password: 'mypassword',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short name', () => {
      const result = registerFormSchema.safeParse({
        fullName: 'C',
        email: 'carlos@cofi.com',
        password: 'mypassword',
      });
      expect(result.success).toBe(false);
    });
  });
});
