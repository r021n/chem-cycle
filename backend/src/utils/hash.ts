import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

// Cost factor bcrypt bisa diturunkan di Cloudflare Workers Free (limit CPU 10ms).
// Contoh: BCRYPT_ROUNDS=6 di .dev.vars / wrangler vars, 10 di shared hosting Node.
function bcryptRounds(): number {
  const raw = Number(process.env.BCRYPT_ROUNDS);
  if (Number.isFinite(raw) && raw >= 4 && raw <= 15) {
    return raw;
  }
  return 10;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, bcryptRounds());
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashIp(ip: string): string {
  const salt = process.env.JWT_SECRET || 'chem-cycle-salt';
  return crypto.createHmac('sha256', salt).update(ip).digest('hex').slice(0, 32);
}

export function generateSlug(title: string): string {
  const s = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return s || 'item-' + Date.now();
}
