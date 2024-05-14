import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { EmailService } from 'src/modules/email/email.service';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserService } from 'src/modules/user/user.service';

import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies/at.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    LocalStrategy,
    AtStrategy,
    RtStrategy,
    UserService,
    UserRepository,
    EmailService,
  ],
  imports: [PrismaModule, JwtModule],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
