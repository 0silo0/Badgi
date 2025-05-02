import {
  Controller,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
  Res,
  ConflictException,
  RequestTimeoutException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { ResetPassword, SendCodeDto, VerifyCodeDto } from './dto/send-code.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Public()
@Controller('auth')
export class AuthController {
  private userId: string;
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

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

  @Post('send-confirmation-code-reset-email')
  @HttpCode(200)
  async sendConfirmationCodeResetEmail(@Body() dto: SendCodeDto) {
    try {
      const type = 'resetEmail';
      await this.authService.sendConfirmationCode(dto, type);
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

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPassword) {
    const isValid = await this.authService.resetPassword(dto);
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
    const user = await this.authService.loginVerify(
      body.loginOrEmail,
      body.password,
    );
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

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(200)
  refresh(@Req() req: Request) {
    // Guard уже проверит refresh token и обновит токены
    return { success: true };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      let userId = req.user?.primarykey;
      console.log(userId)
      if (!userId) {
        const refreshToken = req.cookies?.refreshToken;
        console.log(refreshToken)
        if (refreshToken) {
          const payload = this.jwtService.verify(refreshToken, {
            secret: process.env.JWT_REFRESH_SECRET,
          });
          console.log(payload.sub)
          userId = payload.sub;
        }
      }

      if (userId) {
        await this.authService.logout(userId);
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        domain:
          process.env.NODE_ENV === 'production' ? 'goal-path.ru' : 'localhost',
      });

      return res.send({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      // Все равно очищаем куки при ошибке
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        domain:
          process.env.NODE_ENV === 'production' ? 'goal-path.ru' : 'localhost',
      });
      return res.status(200).send({ message: 'Logged out with issues' });
    }
  }
}
