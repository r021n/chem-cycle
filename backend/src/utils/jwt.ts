import { sign, verify } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'chemcycle-super-secret-dev-key-2026';

export interface TokenPayload {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
  fullName: string;
  exp?: number;
}

export async function createToken(payload: Omit<TokenPayload, 'exp'>): Promise<string> {
  // Token expires in 7 days
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  return sign({ ...payload, exp }, JWT_SECRET, 'HS256');
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const payload = await verify(token, JWT_SECRET, 'HS256');
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
