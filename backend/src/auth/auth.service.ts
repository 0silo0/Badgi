import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { createClient } from 'redis';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  private readonly redis: Redis;

  constructor(
    private jwtService: JwtService,
    @Inject('REDIS_CLIENT') redisClient: Redis,
    private prisma: PrismaService,
  ) {
    this.redis = redisClient;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.account.findUnique({ 
      where: { email },
      include: { roleRef: true }
    });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async debugRedis() {
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();
    
    const keys = await client.keys('refresh_*');
    console.log('Direct Redis keys:', keys);
    
    await client.quit();
  }

  async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: '7d' },
    );
    try {
      await this.redis.set(
        `refresh_${userId}`,
        refreshToken,
        'EX',
        7 * 24 * 60 * 60,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Redis error:', error.message);
      }
      throw new Error('Failed to save token');
    }
  
    return { accessToken, refreshToken };
  }

  async validateRefreshToken(userId: string, token: string) {
    const storedToken = await this.redis.get(`refresh_${userId}`);
    return storedToken === token;
  }

  async logout(userId: string) {
    await this.redis.del(`refresh_${userId}`);
  }

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    return this.prisma.account.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        login: dto.login,
        firstName: dto.firstName,
        lastName: dto.lastName,
        createAt: new Date(),
        editAt: new Date(),
      },
    });
  }
}