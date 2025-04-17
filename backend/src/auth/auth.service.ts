import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { createClient } from 'redis';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
  ) {}

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


  
    console.log('Before saving to Redis - userId:', userId);
    console.log('Generated tokens:', { accessToken, refreshToken });
    
    try {
      // Указываем TTL в миллисекундах
      await this.cacheManager.set(
        `refresh_${userId}`,
        refreshToken,
        7 * 24 * 60 * 60,
      );

      const stored = await this.cacheManager.get(`refresh_${userId}`);
      console.log('Stored in Redis:', stored);
      
      // Прямая проверка через redis клиент
      const client = createClient({ url: process.env.REDIS_URL });
      await client.connect();
      const keys = await client.keys('*');
      console.log('All Redis keys:', keys);
    } catch (error) {
      console.error('Redis error:', error);
    }
  
    return { accessToken, refreshToken };
  }

  async validateRefreshToken(userId: string, token: string) {
    const storedToken = await this.cacheManager.get(`refresh_${userId}`);
    return storedToken === token;
  }

  async logout(userId: string) {
    await this.cacheManager.del(`refresh_${userId}`);
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

  async getRefreshToken(userId: string) {
    const refreshToken = this.cacheManager.get(`refresh_${userId}`);
    console.log('Token - ', refreshToken);
    return refreshToken;
  }
}