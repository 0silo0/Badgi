import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import Redis from 'ioredis';
import { userInfo } from 'os';

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

  async validateUser(login: string, password: string): Promise<string | null> {
    const user = await this.prisma.account.findUnique({
      where: { login },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user.primarykey;
    }

    return null;
  }

  async generateTokens(userId: string, rememberMe: boolean) {
    if (rememberMe) {
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

      return { accessToken };
    } else {
      const accessToken = this.jwtService.sign(
        { sub: userId },
        { expiresIn: '15m' },
      );

      return { accessToken };
    }
  }

  async validateRefreshToken(userId: string, token: string) {
    const storedToken = await this.redis.get(`refresh_${userId}`);
    return storedToken === token;
  }

  async logout(userId: string) {
    await this.redis.del(`refresh_${userId}`);
    console.log('Удален токен для пользователя - ', userId);
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
