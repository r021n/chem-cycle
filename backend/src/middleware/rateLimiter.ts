import { createMiddleware } from 'hono/factory';
import { hashIp } from '../utils/hash.js';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(name: string): Map<string, RateLimitEntry> {
  let store = stores.get(name);
  if (!store) {
    store = new Map<string, RateLimitEntry>();
    stores.set(name, store);
  }
  return store;
}

export function createRateLimiter(options: {
  name: string;
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  const store = getStore(options.name);

  // Periodic cleanup every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return createMiddleware(async (c, next) => {
    const rawIp =
      c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
      c.req.header('x-real-ip') ||
      '127.0.0.1';
    const clientKey = hashIp(rawIp);
    const now = Date.now();

    let entry = store.get(clientKey);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: now + options.windowMs };
      store.set(clientKey, entry);
    } else {
      entry.count += 1;
    }

    const remaining = Math.max(0, options.maxRequests - entry.count);
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);

    c.header('X-RateLimit-Limit', options.maxRequests.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000).toString());

    if (entry.count > options.maxRequests) {
      c.header('Retry-After', retryAfterSeconds.toString());
      return c.json(
        {
          success: false,
          message:
            options.message ||
            `Terlalu banyak permintaan. Mohon tunggu ${retryAfterSeconds} detik sebelum mencoba kembali.`,
          retryAfter: retryAfterSeconds,
        },
        429
      );
    }

    await next();
  });
}

// Pre-configured rate limiters
export const commentRateLimiter = createRateLimiter({
  name: 'comments',
  windowMs: 2 * 60 * 1000, // 2 minutes window
  maxRequests: 3, // max 3 comments per 2 minutes
  message:
    'Proteksi Spam Aktif: Anda telah mengirim beberapa komentar berturut-turut. Mohon tunggu sejenak sebelum mengirim komentar baru.',
});

export const authRateLimiter = createRateLimiter({
  name: 'auth_login',
  windowMs: 15 * 60 * 1000, // 15 minutes window
  maxRequests: 10, // max 10 attempts
  message:
    'Terlalu banyak upaya masuk gagal. Demi keamanan, akun dibatasi sementara selama 15 menit.',
});

export const generalRateLimiter = createRateLimiter({
  name: 'general',
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 180,
});
