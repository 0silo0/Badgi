import {
  Controller,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from 'src/common/decorators/public.decorator';

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
  ) {
    const user = await this.authService.validateUser(body.login, body.password);
    if (!user) {
      throw new UnauthorizedException(
        'Неверные данные для входа, логин или пароль.',
      );
    }

    return this.authService.generateTokens(user, !!body.rememberMe);
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
