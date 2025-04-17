import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import redisClient from '../config/redis';

export const registerUser = async (firstName: string, lastName: string, email: string, login: string, password: string) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const account = await prisma.account.create({
      data: {
        firstName,
        lastName,
        email,
        login,
        password: hashedPassword,
      },
    });

    return account;
  } catch (error) {
    console.error('Error in registerUser:', error);
    throw error;
  }
};

export const loginUser = async (login: string, password: string) => {
  try {
    const account = await prisma.account.findUnique({
      where: { login },
    });

    if (!account || !(await bcrypt.compare(password, account.password))) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ primarykey: account.primarykey }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    await redisClient.set(`token:${account.primarykey}`, token, {
      EX: 3600, // Время жизни токена в секундах (1 час)
    });

    return token;
  } catch (error) {
    console.error('Error in loginUser:', error);
    throw error;
  }
};

export const logoutUser = async (accountId: string) => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // Удаляем токен из Redis
    await redisClient.del(`token:${accountId}`);
  } catch (error) {
    console.error('Error in logoutUser:', error);
    throw error;
  }
};

export const verifyToken = async (accountId: string, token: string) => {
  // Проверяем, что токен совпадает с сохраненным в Redis
  const storedToken = await redisClient.get(`token:${accountId}`);
  return storedToken === token;
};