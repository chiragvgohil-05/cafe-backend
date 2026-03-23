import { Router } from 'express';
import DashboardController from './DashboardController.js';
import AuthMiddleware from '../../Middlewares/AuthMiddleware.js';
import requireRole from '../../Middlewares/RoleMiddleware.js';

const router = Router();

router.get('/stats', AuthMiddleware, requireRole('admin'), DashboardController.getDashboardStats);

export default router;
