// routes/userRoutes.js
import { Router } from 'express';
import { getProfile } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// User-only route
router.get('/profile', authenticateUser, requireRole('user'), getProfile);

export default router;