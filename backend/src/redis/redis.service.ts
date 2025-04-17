import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async setCacheKey(key: string, value: string): Promise<void> {
        await this.cacheManager.set(key, value);
    }

    async getCacheKey(key: string): Promise<void> {
        const value = await this.cacheManager.get(key);
        console.log(value)
    }
}