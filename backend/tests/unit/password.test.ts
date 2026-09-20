import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../src/utils/password.js';

describe('Password Utility', () => {
  it('should hash a password and verify correctly', async () => {
    const rawPassword = 'SecretPassword123!';
    const hashed = await hashPassword(rawPassword);

    expect(hashed).not.toBe(rawPassword);
    expect(typeof hashed).toBe('string');
    expect(hashed.length).toBeGreaterThan(20);

    const isMatch = await comparePassword(rawPassword, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('WrongPassword', hashed);
    expect(isWrongMatch).toBe(false);
  });
});
