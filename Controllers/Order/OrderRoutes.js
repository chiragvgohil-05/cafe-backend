import { Router } from "express";
import OrderController from '../Order/OrderController.js';
import requireRole from '../../Middlewares/RoleMiddleware.js';

const router = Router();

// Publicly available to all logged-in users
router.post('/create', OrderController.createOrder);

// Admin-only management routes
router.get('/lists', requireRole('admin'), OrderController.getOrder);
router.get('/active-order', OrderController.getActiveOrder);
router.get('/order-status', requireRole('admin'), OrderController.getOrderStatus);
router.post('/:orderId/status', requireRole('admin'), OrderController.updateOrderStatus)

export default router;