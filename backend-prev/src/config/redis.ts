import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

export const connectToRedis = async () => {
    try {
    await redisClient.connect();
    console.log('Connected to Redis');
    } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
    }
};

export const closeRedisConnection = async () => {
    try {
        await redisClient.quit();
        console.log('Disconnected from Redis');
    } catch (error) {
        console.error('Failed to disconnect from Redis:', error);
    }
};

export default redisClient;