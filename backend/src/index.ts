import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import * as dotenv from 'dotenv';
import { errorHandler } from './middlewares/error-middleware.js';
import { loggerMiddleware } from './middlewares/logger-middleware.js';
import { authRoutes } from './routes/auth.routes.js';
import { modulesRoutes } from './routes/modules.routes.js';
import { materialsRoutes } from './routes/materials.routes.js';
import { quizzesRoutes } from './routes/quizzes.routes.js';
import { attemptsRoutes } from './routes/attempts.routes.js';
import { activitiesRoutes } from './routes/activities.routes.js';
import { discussionsRoutes } from './routes/discussions.routes.js';
import { uploadsRoutes } from './routes/uploads.routes.js';

dotenv.config();

export const app = new Hono();

// Global Middlewares
app.use('*', loggerMiddleware);
app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

// Serve static uploaded files
app.use('/uploads/*', serveStatic({ root: './' }));

// Health Check
app.get('/', (c) => {
  return c.json({
    status: 'online',
    system: 'ChemCycle Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/health', (c) => {
  return c.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes (prefix /api/v1)
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/modules', modulesRoutes);
app.route('/api/v1/materials', materialsRoutes);
app.route('/api/v1/quizzes', quizzesRoutes);
app.route('/api/v1/attempts', attemptsRoutes);
app.route('/api/v1/activities', activitiesRoutes);
app.route('/api/v1/discussions', discussionsRoutes);
app.route('/api/v1/uploads', uploadsRoutes);

// Global Error Handler
app.onError(errorHandler);

// 404 Handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: `Rute '${c.req.path}' tidak ditemukan pada server ChemCycle`,
    },
    404
  );
});

// Start Node.js HTTP Server if not imported in test environment
const PORT = Number(process.env.PORT) || 3000;
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  serve(
    {
      fetch: app.fetch,
      port: PORT,
    },
    (info) => {
      console.log(`ChemCycle Server berjalan di http://localhost:${info.port}`);
    }
  );
}

export default app;
