import express from 'express';
import { getAvailableTables, createReservation, getReservations, getAllReservations, updateReservationStatus, deleteReservation, createReservationPaymentOrder, verifyReservationPayment } from './ReservationController.js';
import AuthMiddleware from '../../Middlewares/AuthMiddleware.js';
import requireRole from '../../Middlewares/RoleMiddleware.js';

const router = express.Router();

router.get('/available', getAvailableTables);
router.post('/', createReservation);
router.post('/payment/create', createReservationPaymentOrder);
router.post('/payment/verify', verifyReservationPayment);
router.get('/all', AuthMiddleware, requireRole('admin'), getAllReservations);
router.patch('/:id/status', AuthMiddleware, requireRole('admin'), updateReservationStatus);
router.delete('/:id', AuthMiddleware, requireRole('admin'), deleteReservation);
router.get('/', getReservations);

export default router;
