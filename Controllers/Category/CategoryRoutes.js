import { Router } from 'express';
import categoryController from '../Category/CategoryController.js';
import upload from '../../Middlewares/Multer.js';
const router = Router();

// menu-category routes
router.post('/create',categoryController.create)
router.get('/lists',categoryController.list)

// item menu routes
router.post('/menu', upload.single('image'), categoryController.createMenu);
router.get('/menu-list',categoryController.menuList)
export default router;