import { Router } from 'express';
import ReservationController from './ReservationController.js';

const router = Router();

router.post('/create', ReservationController.createReservation);
router.get('/list', ReservationController.listReservations);
router.post('/confirm/:reservationId', ReservationController.confirmReservation);
router.post('/complete/:reservationId', ReservationController.completeReservation);
router.get('/availability', ReservationController.listAvailableTables);
router.post('/walk-in', ReservationController.createWalkInReservation);

export default router;
