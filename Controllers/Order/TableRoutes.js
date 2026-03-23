import { Router } from 'express';
import TableController from '../Tables/TableController.js';
import requireRole from '../../Middlewares/RoleMiddleware.js';

const router = Router();

// Publicly available to all logged-in users (to select their table)
router.get('/list', TableController.listTables);

// Admin-only management routes
router.post('/create', requireRole('admin'), TableController.create);
router.post('/update/:tableId', requireRole('admin'), TableController.update);
router.delete('/delete/:tableId', requireRole('admin'), TableController.remove);

export default router;
