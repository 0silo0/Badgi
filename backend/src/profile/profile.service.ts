import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<ProfileDto> {
    const user = await this.prisma.account.findUnique({
      where: { primarykey: userId },
      select: {
        primarykey: true,
        firstName: true,
        lastName: true,
        email: true,
        login: true,
        avatarUrl: true,
        createAt: true,
        editAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      primarykey: user.primarykey,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      login: user.login,
      avatarUrl: user.avatarUrl || null,
      createAt: user.createAt,
      editAt: user.editAt,
    };
  }
}
