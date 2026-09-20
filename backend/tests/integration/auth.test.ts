import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/index.js';
import { initDatabaseSchema } from '../helpers.js';

describe('Auth Endpoints Integration', () => {
  beforeAll(async () => {
    await initDatabaseSchema();
  });

  const testUser = {
    username: `user_${Date.now()}`,
    email: `user_${Date.now()}@chemcycle.test`,
    password: 'password123',
    fullName: 'Integration Test User',
    role: 'student' as const,
  };

  let token = '';

  it('should successfully register a new user', async () => {
    const res = await app.request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(testUser.email);
    expect(body.data.user.username).toBe(testUser.username);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.passwordHash).toBeUndefined(); // Security: never return hash!
  });

  it('should reject duplicate registration with same email or username', async () => {
    const res = await app.request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    expect(res.status).toBe(409);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
  });

  it('should fail login with incorrect password', async () => {
    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testUser.email,
        password: 'WrongPassword!',
      }),
    });

    expect(res.status).toBe(401);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
  });

  it('should successfully login with valid credentials and return JWT', async () => {
    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testUser.email,
        password: testUser.password,
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
    token = body.data.token;
  });

  it('should fetch authenticated user profile via /auth/me', async () => {
    const res = await app.request('/api/v1/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(testUser.email);
  });

  it('should reject /auth/me without Authorization header', async () => {
    const res = await app.request('/api/v1/auth/me', {
      method: 'GET',
    });

    expect(res.status).toBe(401);
  });

  it('should successfully change password and allow login with new password', async () => {
    const newPassword = 'NewSecretPassword2026!';

    const changeRes = await app.request('/api/v1/auth/change-password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: testUser.password,
        newPassword: newPassword,
        confirmPassword: newPassword,
      }),
    });

    expect(changeRes.status).toBe(200);

    // Verify login with new password
    const loginRes = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testUser.email,
        password: newPassword,
      }),
    });

    expect(loginRes.status).toBe(200);
  });
});
