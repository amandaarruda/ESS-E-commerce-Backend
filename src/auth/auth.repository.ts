import { Injectable } from '@nestjs/common';
import { Prisma, StatusEnum } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updateRefreshToken(userId: number, refreshToken: string) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: refreshToken,
      },
    });
  }
}
