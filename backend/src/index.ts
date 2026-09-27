import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { bodyLimit } from 'hono/body-limit';
import dotenv from 'dotenv';

import { authRoutes } from './routes/auth.routes.js';
import { materialsRoutes } from './routes/materials.routes.js';
import { commentsRoutes } from './routes/comments.routes.js';
import { activitiesRoutes } from './routes/activities.routes.js';
import { quizzesRoutes } from './routes/quizzes.routes.js';
import { mediaRoutes } from './routes/media.routes.js';
import { logsRoutes } from './routes/logs.routes.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = new Hono();

// Global Security & Utility Middlewares
app.use(
  '*',
  cors({
    origin: (origin) => {
      // Allow localhost dev servers or configured CORS origin
      const allowed = process.env.CORS_ORIGIN || 'http://localhost:5173';
      if (!origin || origin.startsWith('http://localhost') || origin === allowed) {
        return origin || allowed;
      }
      return allowed;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'Retry-After'],
    maxAge: 86400,
    credentials: true,
  })
);

app.use('*', secureHeaders());
app.use('*', generalRateLimiter);
app.use(
  '*',
  bodyLimit({
    maxSize: 10 * 1024 * 1024, // 10 MB maximum request payload
    onError: (c) => {
      return c.json({ success: false, message: 'Payload terlalu besar (Maksimal 10 MB)' }, 413);
    },
  })
);

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'chem-cycle-backend',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.route('/api/auth', authRoutes);
app.route('/api/materials', materialsRoutes);
app.route('/api', commentsRoutes);
app.route('/api/activities', activitiesRoutes);
app.route('/api/quizzes', quizzesRoutes);
app.route('/api/media', mediaRoutes);
app.route('/api', logsRoutes);

// 404 Handler
app.notFound((c) => {
  return c.json({ success: false, message: 'Rute API tidak ditemukan' }, 404);
});

// Error Handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json(
    {
      success: false,
      message: err.message || 'Terjadi kesalahan internal pada server',
    },
    500
  );
});

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Chem-Cycle Backend Server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
