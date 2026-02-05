import express from 'express';
import { getAvailableTables, createReservation, getReservations, getAllReservations, updateReservationStatus, deleteReservation } from './ReservationController.js';

const router = express.Router();

router.get('/available', getAvailableTables);
router.post('/', createReservation);
router.get('/all', getAllReservations);
router.patch('/:id/status', updateReservationStatus);
router.delete('/:id', deleteReservation);
router.get('/', getReservations);

export default router;
