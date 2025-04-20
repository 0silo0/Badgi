import {
  Controller,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
  Res,
  ConflictException,
  RequestTimeoutException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { SendCodeDto, VerifyCodeDto } from './dto/send-code.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-confirmation-code')
  @HttpCode(200)
  async sendConfirmationCode(@Body() dto: SendCodeDto) {
    try {
      await this.authService.sendConfirmationCode(dto);
      return { success: true };
    } catch (error) {
      if (error instanceof RequestTimeoutException) {
        throw new RequestTimeoutException(error.message);
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Post('verify-confirmation-code')
  @HttpCode(200)
  async verifyConfirmationCode(@Body() dto: VerifyCodeDto) {
    const isValid = await this.authService.verifyConfirmationCode(dto);
    if (!isValid) {
      throw new UnauthorizedException('Неверный или просроченный код');
    }
    return { success: true };
  }

  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const user = await this.authService.loginVerify(body.login, body.password);
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
      httpOnly: true, // Only server has access to the cookie
      secure: process.env.NODE_ENV === 'production', // Secure in production mode
      sameSite: 'lax', // Prevent cross-site attacks
      path: '/', // Available at all paths
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
