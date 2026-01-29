import { Router } from 'express';

import AuthController from '../Auth/AuthController.js';

const router = Router();

// Auth Routers
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);


export default router