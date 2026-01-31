import { Router } from 'express';
import categoryController from '../Category/CategoryController.js';
import upload from '../../Middlewares/Multer.js';
const router = Router();

// menu-category routes
router.post('/create', categoryController.create)
router.get('/lists', categoryController.list)
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

// item menu routes
router.post('/menu', upload.single('image'), categoryController.createMenu);
router.get('/menu-list', categoryController.menuList)
router.put('/menu/:id', upload.single('image'), categoryController.updateMenu);
router.delete('/menu/:id', categoryController.deleteMenu);

export default router;