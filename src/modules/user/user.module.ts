import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthRepository } from 'src/auth/auth.repository';
import { AuthService } from 'src/auth/auth.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';

import { EmailService } from '../email/email.service';
import { UserController } from './user.controller';
import { UserMapping } from './user.mapping';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    UserMapping,
    UserRepository,
    AuthRepository,
    EmailService,
  ],
  imports: [PrismaModule, JwtModule],
  exports: [UserService, UserRepository],
})
export class UserModule {}
