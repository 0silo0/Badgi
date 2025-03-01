import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import redisClient from '../config/redis';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { primarykey: string };
    const storedToken = await redisClient.get(`token:${decoded.primarykey}`);

    if (!storedToken || storedToken !== token) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    // Добавляем пользователя в запрос
    req.user = { primarykey: decoded.primarykey };

    next();
  } catch (error) {
    console.error('Error in authenticate middleware:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};