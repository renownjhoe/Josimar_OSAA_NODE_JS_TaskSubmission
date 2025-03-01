import { Router } from 'express';
import { getAllUsers } from '../controllers/adminController.js';
import { requireRole } from '../middleware/rbac.js';
import { authenticateUser } from '../middleware/authMiddleware.js';


const router = Router();

// Admin-only route
//get all registered users
router.get('/users', authenticateUser, requireRole('admin'), getAllUsers);

export default router;