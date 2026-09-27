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

interface RateLimitBinding {
  limit: (options: { key: string }) => Promise<{ success: boolean }>;
}

export function createRateLimiter(options: {
  name: string;
  windowMs: number;
  maxRequests: number;
  message?: string;
  /**
   * Nama binding Cloudflare Rate Limiting (di wrangler.jsonc) — dipakai hanya
   * jika tersedia (Workers). Jika tidak ada (Node/shared hosting), fallback
   * ke penyimpanan in-memory di bawah.
   */
  bindingName?: string;
  /** Limit request per periode pada binding CF (periode hanya boleh 10 atau 60 detik). */
  bindingLimit?: number;
  bindingPeriodSeconds?: number;
}) {
  const store = getStore(options.name);

  // Catatan: tanpa setInterval — timer pada module scope dilarang di Cloudflare
  // Workers ("Disallowed operation called within global scope"). Pembersihan
  // entry kedaluwarsa dilakukan secara lazy saat ada traffic (di bawah).

  return createMiddleware(async (c, next) => {
    const rawIp =
      c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
      c.req.header('x-real-ip') ||
      '127.0.0.1';
    const clientKey = hashIp(rawIp);

    // 1) Cloudflare Rate Limiting binding (Workers, state lintas-isolate)
    const env = c.env as unknown as Record<string, unknown> | undefined;
    const binding = options.bindingName ? env?.[options.bindingName] : undefined;
    if (
      binding &&
      typeof binding === 'object' &&
      typeof (binding as RateLimitBinding).limit === 'function'
    ) {
      const { success } = await (binding as RateLimitBinding).limit({ key: clientKey });
      const cfLimit = options.bindingLimit ?? options.maxRequests;
      const cfPeriod = options.bindingPeriodSeconds ?? 60;

      c.header('X-RateLimit-Limit', cfLimit.toString());
      c.header('X-RateLimit-Remaining', success ? '1' : '0');

      if (!success) {
        c.header('Retry-After', cfPeriod.toString());
        return c.json(
          {
            success: false,
            message:
              options.message ||
              `Terlalu banyak permintaan. Mohon tunggu ${cfPeriod} detik sebelum mencoba kembali.`,
            retryAfter: cfPeriod,
          },
          429
        );
      }

      await next();
      return;
    }

    // 2) Fallback in-memory (Node/shared hosting, atau Workers tanpa binding)
    const now = Date.now();

    // Prune entry kedaluwarsa secara opportunistic (pengganti interval cleanup).
    if (store.size > 256) {
      for (const [key, stale] of store.entries()) {
        if (stale.resetAt <= now) {
          store.delete(key);
        }
      }
    }

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
  bindingName: 'RATE_LIMIT_COMMENTS',
  bindingLimit: 3,
  bindingPeriodSeconds: 60, // CF hanya mendukung periode 10 atau 60 detik
  message:
    'Proteksi Spam Aktif: Anda telah mengirim beberapa komentar berturut-turut. Mohon tunggu sejenak sebelum mengirim komentar baru.',
});

export const authRateLimiter = createRateLimiter({
  name: 'auth_login',
  windowMs: 15 * 60 * 1000, // 15 minutes window
  maxRequests: 10, // max 10 attempts
  bindingName: 'RATE_LIMIT_AUTH',
  bindingLimit: 10,
  bindingPeriodSeconds: 60, // CF hanya mendukung periode 10 atau 60 detik
  message:
    'Terlalu banyak upaya masuk gagal. Demi keamanan, akun dibatasi sementara selama 15 menit.',
});

export const generalRateLimiter = createRateLimiter({
  name: 'general',
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 180,
  bindingName: 'RATE_LIMIT_GENERAL',
  bindingLimit: 180,
  bindingPeriodSeconds: 60,
});
