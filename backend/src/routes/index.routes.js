import { Router } from 'express';
import dependentRoutes from './dependent.routes.js';
import medicationRoutes from './medication.routes.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.use('/dependents', dependentRoutes);
router.use('/medications', medicationRoutes);

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
