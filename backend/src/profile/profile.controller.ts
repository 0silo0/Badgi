import { Controller, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { ProfileDto } from './dto/profile.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request): Promise<ProfileDto> {
    let userId = req.user?.primarykey;
    if (!userId) {
      const refreshToken = req.cookies?.refreshToken;
      console.log('qwer - ', refreshToken)
      if (refreshToken) {
        try {
          const payload = this.jwtService.verify(refreshToken, {
          secret: process.env.JWT_REFRESH_SECRET,
        });
          userId = payload.sub;
        } catch (err) {
          throw new UnauthorizedException('Invalid refresh token');
        }
      }
    }

    if (!userId) {
      throw new UnauthorizedException('User ID not found when getting profile');
    }

    return this.profileService.getProfile(userId);
  }
}
