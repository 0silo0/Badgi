import { Controller, Post, Body, HttpCode, UnauthorizedException, UseInterceptors, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  @CacheKey('userToken')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    console.log('INSIDE CINTROLLER');
    return this.authService.generateTokens(user.primarykey);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body('userId') userId: string, @Body('token') token: string) {
    if (await this.authService.validateRefreshToken(userId, token)) {
      return this.authService.generateTokens(userId);
    }
    throw new UnauthorizedException('Invalid refresh token');
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body('userId') userId: string) {
    await this.authService.logout(userId);
    return { message: 'Logged out' };
  }

  @Get('getToken')
  @HttpCode(200)
  async get(@Body('userId') userId: string) {
    // await this.authService.getRefreshToken(userId);
    return this.authService.getRefreshToken(userId);
  }
}