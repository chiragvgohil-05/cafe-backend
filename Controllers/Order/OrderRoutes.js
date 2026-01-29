import { Router } from "express";
import OrderController from '../Order/OrderController.js';
import orderController from '../Order/OrderController.js';

const router = Router();

router.post('/create', OrderController.createOrder);
router.get('/lists', orderController.getOrder);
router.get('/order-status', orderController.getOrderStatus);
router.post('/:orderId/status',orderController.updateOrderStatus)


export default router;