import { Router } from 'express';
import dependentRoutes from './dependent.routes.js';
import medicationRoutes from './medication.routes.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Todo lo que toca datos de un cuidador exige sesión. /health queda público.
router.use('/dependents', requireAuth, dependentRoutes);
router.use('/medications', requireAuth, medicationRoutes);

// GET /api/health — el servidor responde y la base también.
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'ok' });
  } catch {
    res.status(503).json({ status: 'error', db: 'unreachable' });
  }
});

export default router;
