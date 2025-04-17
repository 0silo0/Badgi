import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: ConfigService): Redis => {
        const redisOptions: RedisOptions = {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          db: config.get<number>('REDIS_DB', 0),
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            console.log(`Redis reconnecting attempt #${times}, delay: ${delay}ms`);
            return delay;
          },
        };

        const redisClient = new Redis(redisOptions);

        redisClient.on('connect', () => {
          console.log('Redis connected successfully');
        });

        redisClient.on('error', (err) => {
          console.error('Redis connection error:', err.message);
        });

        return redisClient;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}