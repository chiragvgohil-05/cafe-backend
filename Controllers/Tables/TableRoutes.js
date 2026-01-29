import { Router } from 'express';
import TableController from '../Tables/TableController.js';

const router = Router();

router.post('/create',TableController.create);
router.get('/list', TableController.listTables);
router.post('/update/:tableId', TableController.update)
router.delete('/delete/:tableId', TableController.remove);

export default router;