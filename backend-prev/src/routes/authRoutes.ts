// src/routes/authRoutes.ts
import { Router } from 'express';
import { signUp, register, logout } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', signUp);
router.post('/logout', authenticate, logout)

export default router;