import { Router } from 'express';
import PaymentController from '../Payment/PaymentController.js';

const router = Router();

router.post('/create',PaymentController.createPaymentOrder)
router.post('/verify',PaymentController.paymentVerify)

export default router;