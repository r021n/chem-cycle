import { describe, it, expect } from 'vitest';
import { createToken, verifyToken } from '../../src/utils/jwt.js';

describe('JWT Utility', () => {
  it('should generate a token and decode valid payload', async () => {
    const userPayload = {
      id: 'test-user-id-123',
      username: 'teststudent',
      email: 'student@chemcycle.test',
      role: 'student' as const,
      fullName: 'Test Student',
    };

    const token = await createToken(userPayload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const verified = await verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(userPayload.id);
    expect(verified?.username).toBe(userPayload.username);
    expect(verified?.email).toBe(userPayload.email);
    expect(verified?.role).toBe('student');
  });

  it('should return null for corrupted or invalid tokens', async () => {
    const verified = await verifyToken('invalid.jwt.token.string');
    expect(verified).toBeNull();
  });
});
