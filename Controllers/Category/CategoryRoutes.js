import { Router } from 'express';
import categoryController from '../Category/CategoryController.js';
import upload from '../../Middlewares/Multer.js';
import AuthMiddleware from '../../Middlewares/AuthMiddleware.js';
import requireRole from '../../Middlewares/RoleMiddleware.js';
const router = Router();

// Public route for user-side homepage/menu
router.get('/menu-list', categoryController.menuList);

// Admin-only routes
router.use(AuthMiddleware, requireRole('admin'));

// menu-category routes
router.post('/create', categoryController.create);
router.get('/lists', categoryController.list);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

// item menu routes
router.post('/menu', upload.single('image'), categoryController.createMenu);
router.put('/menu/:id', upload.single('image'), categoryController.updateMenu);
router.get('/menu-items-admin', categoryController.menuItemsAdmin);
router.delete('/menu/:id', categoryController.deleteMenu);

export default router;
