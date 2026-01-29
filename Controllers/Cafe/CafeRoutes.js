import { Router } from 'express';
import CafeController from '../Cafe/CafeController.js';

const router = Router();
router.post('/create',CafeController.create);
router.get('/lists', CafeController.getCafeList);
router.post('/update/:id',CafeController.updateCafe);
router.delete('/delete/:id',CafeController.deleteCafe);

export default router;