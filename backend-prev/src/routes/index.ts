// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './authRoutes';
import s3Routes from "./s3Routes";

const router = Router();

router.use('/auth', authRoutes);
router.use('/s3', s3Routes);


export default router;