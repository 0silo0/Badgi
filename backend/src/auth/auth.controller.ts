import {
  Controller,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Response } from 'express';

@Public()
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
  async login(
    @Body() body: { login: string; password: string; rememberMe?: boolean },
    @Res() res: Response,
  ) {
    const user = await this.authService.validateUser(body.login, body.password);
    if (!user) {
      throw new UnauthorizedException(
        'Неверные данные для входа, логин или пароль.',
      );
    }

    const tokens = await this.authService.generateTokens(
      user,
      !!body.rememberMe,
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,           // Only server has access to the cookie
      secure: process.env.NODE_ENV === 'production', // Secure in production mode
      sameSite: 'lax',          // Prevent cross-site attacks
      path: '/',                // Available at all paths
      maxAge: 7 * 24 * 60 * 60 * 1000, // Expire after 7 days
    });

    return res.send({ accessToken: tokens.accessToken });
  }

  // @Post('refresh')
  // @HttpCode(200)
  // async refresh(@Body('userId') userId: string, @Body('token') token: string) {
  //   if (await this.authService.validateRefreshToken(userId, token)) {
  //     return this.authService.generateTokens(userId);
  //   }
  //   throw new UnauthorizedException('Invalid refresh token');
  // }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body('userId') userId: string) {
    await this.authService.logout(userId);
    return { message: 'Logged out' };
  }
}
