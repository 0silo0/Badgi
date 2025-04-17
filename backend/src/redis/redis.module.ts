import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get('REDIS_URL'),
          ttl: 0,
          database: 0,
        }),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}