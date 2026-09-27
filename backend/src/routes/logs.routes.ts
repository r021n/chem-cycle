import { Hono } from 'hono';
import { desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { auditLogs } from '../db/schema.js';
import { adminAuthMiddleware } from '../middleware/auth.js';

export const logsRoutes = new Hono();

// GET /api/admin/logs (Protected)
logsRoutes.get('/admin/logs', adminAuthMiddleware, async (c) => {
  const logs = await getDb()
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(50)
    .all();

  return c.json({ success: true, data: logs });
});
