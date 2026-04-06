import express from 'express';
import { authMiddleware, requireSuperUser } from '../../middleware/authMiddleware.js';
import { getAllData, SUPER_USER_EMAIL } from '../../db/operations.js';

const router = express.Router();

// Apply auth middleware first, then require super user
router.use(authMiddleware);
router.use(requireSuperUser);

// GET /api/v1/admin/data - Get all users and projects (super user only)
router.get('/data', async (req, res) => {
  const data = await getAllData();
  res.status(200).json(data);
});

// GET /api/v1/admin/stats - Get basic statistics
router.get('/stats', async (req, res) => {
  const data = await getAllData();
  res.status(200).json({
    stats: data.stats,
    superUserEmail: SUPER_USER_EMAIL
  });
});

export default router;

