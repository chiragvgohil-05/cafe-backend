import { Router } from 'express';
import UserController from './UserController.js';
import AuthMiddleware from '../../Middlewares/AuthMiddleware.js';
import requireRole from '../../Middlewares/RoleMiddleware.js';

const router = Router();

// User profile routes (Self)
router.get('/profile', AuthMiddleware, UserController.getMyProfile);
router.put('/profile', AuthMiddleware, UserController.updateMyProfile);

// Admin user management routes
router.get('/all-users', AuthMiddleware, requireRole('admin'), UserController.getAllUsers);
router.put('/:id', AuthMiddleware, requireRole('admin'), UserController.updateUserById);
router.delete('/:id', AuthMiddleware, requireRole('admin'), UserController.deleteUser);

export default router;
