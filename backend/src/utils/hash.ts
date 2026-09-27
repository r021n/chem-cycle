import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
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
