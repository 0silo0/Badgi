// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './authRoutes';

const router = Router();

router.use('/auth', authRoutes);
// router.use('/map', mapRoutes);

export default router;