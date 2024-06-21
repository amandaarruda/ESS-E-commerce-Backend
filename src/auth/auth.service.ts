import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleEnum, StatusEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { EmailService } from 'src/modules/email/email.service';
import { UserCreateDto } from 'src/modules/user/dto/request/user.create.dto';
import { UserEntity } from 'src/modules/user/entity/user.entity';
import { UserTypeMap } from 'src/modules/user/entity/user.type.map';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserService } from 'src/modules/user/user.service';
import { CrudType } from 'src/utils/base/ICrudTypeMap';
import { guardUser } from 'src/utils/guards/guard-user';
import { hashData } from 'src/utils/hash';
import {
  MessagesHelperKey,
  getMessage,
  setMessage,
} from 'src/utils/messages.helper';
import { recoverTemplateDataBind } from 'src/utils/templates/processors/recover-password-processor';
import { registrationTemplateDataBind } from 'src/utils/templates/processors/registration-processor';
import { handleError } from 'src/utils/treat.exceptions';

import { AuthRepository } from './auth.repository';
import { ChangePasswordByRecovery } from './dto/request/change-password-by-recovery.dto';
import { EmailDto } from './dto/request/email.dto';
import { LoginDto } from './dto/request/login.dto';
import { UserToken } from './dto/response/UserToken';
import { UserPayload } from './models/UserPayload';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, userPassword: string) {
    this.logger.debug(`Validate User`);

    try {
      const user = await this.userService.findByEmail(email);

      if (!user) {
        this.logger.debug(`Error login! user ${email} does not exists`);
        throw new UnauthorizedException(
          getMessage(MessagesHelperKey.PASSWORD_OR_EMAIL_INVALID),
        );
      }

      if (user.status === StatusEnum.INACTIVE) {
        this.logger.debug(`Error login! user ${email} is inactive`);
        throw new UnauthorizedException(
          getMessage(MessagesHelperKey.USER_INACTIVE),
        );
      }

      this.logger.debug(`User ${email} found`);

      const isPasswordValid = await bcrypt.compare(userPassword, user.password);

      if (!isPasswordValid) {
        this.logger.debug(`Error login! password invalid`);

        throw new UnauthorizedException(
          getMessage(MessagesHelperKey.PASSWORD_OR_EMAIL_INVALID),
        );
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      handleError(error);
    }
  }

  async register(registerDto: UserCreateDto): Promise<UserEntity> {
    this.logger.log('POST IN Auth Service - register');

    try {
      this.logger.debug(
        `Verifying if the user with the email ${registerDto.email} already exists in the database`,
      );

      const userAlreadyExists = await this.userService.exists({
        email: registerDto.email,
      });

      if (userAlreadyExists) {
        const message = `Email ${registerDto.email} already registered in the database.`;
        this.logger.debug(message);

        throw new ConflictException(
          getMessage(MessagesHelperKey.USER_ALREADY_REGISTERED),
        );
      }

      const hash = await hashData(registerDto.password);

      this.logger.debug(
        `Password from user ${registerDto.email} hashed successfully`,
      );

      const createUserData: UserTypeMap[CrudType.CREATE] = {
        name: registerDto.name,
        email: registerDto.email,
        password: hash,
        status: StatusEnum.ACTIVE,
        ...(registerDto.image && {
          Media: {
            create: {
              url: registerDto.image,
            },
          },
        }),
        role: RoleEnum.CUSTOMER,
      };

      const newUser = (await this.userService.createAsync(
        createUserData,
      )) as UserEntity;

      this.logger.debug(`User ${newUser.email} created`);

      const tokens: UserToken = await this.getTokens(newUser);

      await this.updateRt(newUser.id, tokens.refreshToken);

      await this.sendRegistrationEmail(newUser.email);

      return newUser;
    } catch (error) {
      handleError(error);
    }
  }

  async updateRt(userId: number, refreshToken: string) {
    this.logger.debug(`Service - updateRt`);

    const refreshTokenHash = await hashData(refreshToken);
    this.logger.debug(`refreshToken hashed ${userId}`);

    const user = await this.authRepository.updateRefreshToken(
      userId,
      refreshTokenHash,
    );

    this.logger.debug(`Refresh token from ${user.email} updated`);
  }

  async checkEmailAvailability(dto: EmailDto): Promise<boolean> {
    this.logger.log(`checkEmail`);

    const alreadyExists = await this.userRepository.exists({
      email: dto.email,
      ...(dto.userBeingEditedId && { id: { not: dto.userBeingEditedId } }),
    });

    return alreadyExists == false;
  }

  async login(user: LoginDto) {
    this.logger.log('POST in Auth Service - login');

    try {
      const usuario = await this.userService.findByEmail(user.email);

      if (!usuario) {
        this.logger.debug(`User ${user.email} not found`);

        throw new UnauthorizedException(
          setMessage(getMessage(MessagesHelperKey.USER_NOT_FOUND), user.email),
        );
      }

      const tokens: UserToken = await this.getTokens(usuario);

      this.logger.debug(`Tokens generated successfully`);

      await this.updateRt(usuario.id, tokens.refreshToken);

      this.logger.debug(`User ${usuario.email} logged in successfully`);

      return tokens;
    } catch (error) {
      handleError(error);
    }
  }

  async refreshToken(currentUser: UserPayload) {
    const refreshToken = currentUser.refreshToken;

    this.logger.log(`Refresh Token`);

    try {
      const userDb = await this.userRepository.findByIdAsync(currentUser.id);

      if (!userDb || !userDb.refreshToken) {
        this.logger.error(
          `User with id ${currentUser.id} not found or not have a refreshToken`,
        );

        throw new ForbiddenException(
          getMessage(MessagesHelperKey.ACCESS_DENIED),
        );
      }

      this.logger.debug(`User ${userDb.email} with ID ${userDb.id} found`);

      const rtMatches = await bcrypt.compare(
        refreshToken,
        userDb?.refreshToken,
      );

      if (!rtMatches) {
        this.logger.debug(
          `refreshToken from user ${userDb.email} doesn't match`,
        );

        throw new ForbiddenException(
          getMessage(MessagesHelperKey.ACCESS_DENIED),
        );
      }

      this.logger.debug(
        `refreshToken from user ${userDb.email} matches. Generating new accessToken and refreshToken`,
      );

      const tokens = await this.getTokens(userDb);

      this.logger.debug(
        `Tokens generated successfully. Updating refreshToken in the user's database`,
      );

      await this.updateRt(userDb.id, tokens.refreshToken);

      this.logger.debug(
        `refreshToken updated successfully in the user's database. Returning tokens and exiting the service "refresh"`,
      );

      return tokens;
    } catch (error) {
      handleError(error);
    }
  }

  async sendRecoveryPasswordEmail(dto: EmailDto) {
    const userDb = await this.userService.findByEmail(dto.email);

    if (
      !userDb ||
      userDb.status === StatusEnum.INACTIVE ||
      userDb.deletedAt != null
    ) {
      this.logger.warn(
        `Usuário ${dto.email} não está apto a receber o email de recuperação`,
      );

      return;
    }

    try {
      this.logger.log(`Sending recovery password email to: ${userDb.email} `);

      const token = await this.encodeEmailToken(userDb.email, userDb.id);

      const tokenEncrypted = await hashData(token);

      await this.sendEmailRecovery(token, userDb);

      await this.userRepository.updateAsync(userDb.id, {
        recoveryPasswordToken: tokenEncrypted,
      });

      this.logger.debug('Recovery password email was sent');
    } catch (error) {
      this.logger.debug('Recovery password email was not sent');

      handleError(error, {
        message: getMessage(MessagesHelperKey.FAIL_SENDING_EMAIL),
      });
    }
  }

  async sendEmailRecovery(token: string, userDb: UserEntity) {
    let templatePath = '';

    const rootDir = process.cwd();

    templatePath = join(rootDir, 'src/utils/templates/recover-password.html');

    const templateHtml = readFileSync(templatePath).toString();

    if (!templateHtml || templateHtml == '') {
      this.logger.debug(`Template not found`);
      throw new Error(
        'Não foi possível encontrar o template de recuperação de email',
      );
    }

    const link = `${process.env.FRONTEND_RECOVER_PASSWORD_URL}?token=${token}`;

    const templateBody = recoverTemplateDataBind(templateHtml, {
      name: userDb.name,
      link,
    });

    const subject = 'Recuperação de senha';

    await this.emailService.sendEmail(templateBody, subject, userDb.email);
  }

  async changePasswordByRecovery(dto: ChangePasswordByRecovery) {
    this.logger.log('POST in Auth Service - changePasswordByRecovery');

    try {
      const userDataByToken: {
        sub: string;
        id: number;
        iat: number;
        exp: number;
      } = await this.decodeEmailToken(dto.recoveryToken);

      const user = (await this.userService.findBy(
        {
          email: userDataByToken.sub,
        },
        {
          id: true,
          email: true,
          recoveryPasswordToken: true,
          status: true,
          deletedAt: true,
        },
      )) as {
        id: number;
        email: string;
        recoveryPasswordToken: string;
        blocked: boolean;
        status: StatusEnum;
        deletedAt: Date | null;
      };

      if (!user) {
        this.logger.debug(`User with email ${userDataByToken.sub} not found`);

        throw new UnauthorizedException(
          setMessage(
            getMessage(MessagesHelperKey.USER_NOT_FOUND),
            userDataByToken.sub,
          ),
        );
      }

      guardUser(
        {
          deletedAt: user?.deletedAt,
          email: user?.email,
          status: user?.status,
        },
        this.logger,
        {
          requestUserEmail: user.email,
        },
      );

      let recoveryTokenIsValid = false;

      if (user?.recoveryPasswordToken) {
        recoveryTokenIsValid = await bcrypt.compare(
          dto.recoveryToken,
          user.recoveryPasswordToken,
        );
      }

      if (!recoveryTokenIsValid) {
        this.logger.debug(
          `Token is invalid. User ${userDataByToken.sub} already changed his password`,
        );

        throw new UnauthorizedException(
          setMessage(
            getMessage(MessagesHelperKey.RECOVERY_PASSWORD_TOKEN_USED),
            userDataByToken.sub,
          ),
        );
      }

      const hash = await hashData(dto.newPassword);

      await this.userRepository.updateUserPassword(user.id, hash);

      this.logger.debug(
        `Password from user ${user.email} changed successfully`,
      );
    } catch (error) {
      handleError(error);
    }
  }

  async decodeEmailToken(recoveryToken: string) {
    this.logger.debug(`Service - decodeEmailToken`);

    let decodedToken: {
      sub: string;
      id: number;
      iat: number;
      exp: number;
    } | null;

    try {
      decodedToken = this.jwtService.verify(recoveryToken, {
        secret: process.env.TK_EMAIL_SECRET,
      });
    } catch (error) {
      this.logger.debug(`Invalid token.`);
      throw new UnauthorizedException(
        getMessage(MessagesHelperKey.INVALID_TOKEN),
      );
    }

    return decodedToken;
  }

  async sendRegistrationEmail(userEmail: string) {
    try {
      const userInDb = await this.userService.findByEmail(userEmail);

      const rootDir = process.cwd();
      const template = `src/utils/templates/registration.html`;

      const templatePath = join(rootDir, template);
      const templateHtml = readFileSync(templatePath).toString();

      if (!templateHtml || templateHtml == '') {
        this.logger.debug(`Template not found`);
        throw new Error(
          'Não foi possível encontrar o template de registro de email',
        );
      }

      const link = process.env.FRONT_END_URL;

      const templateBody = registrationTemplateDataBind(templateHtml, {
        name: userInDb.name,
        link,
      });

      const subject = 'Email de confirmação de registro';

      await this.emailService.sendEmail(templateBody, subject, userEmail);

      this.logger.debug(`Registration email was sent`);
    } catch (error) {
      this.logger.debug(`Registration email email was not sent ${error}`);

      handleError(error, {
        message: getMessage(MessagesHelperKey.FAIL_SENDING_EMAIL),
      });
    }
  }

  async getTokens(user: UserEntity) {
    this.logger.debug(`Service - getTokens`);

    const payload = {
      sub: user.email,
      role: user?.role,
      id: user.id,
      name: user.name,
      email: user.email,
      recoveryPasswordToken: user.recoveryPasswordToken,
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      status: user.status,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.AT_SECRET,
        expiresIn: process.env.JWT_ACCESS_LIFETIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.RT_SECRET,
        expiresIn: process.env.JWT_REFRESH_LIFETIME,
      }),
    ]);

    this.logger.debug(
      `Tokens generated successfully. Returning tokens and exiting the service "getTokens"`,
    );

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async getMe(currentUser: UserPayload) {
    this.logger.debug(`Getting me ${currentUser.email}`);

    const userDb = await this.userRepository.findByIdAsync(currentUser.id);

    const { password, ...userWithoutPassword } = userDb;

    return {
      sub: currentUser.id,
      ...userWithoutPassword,
    };
  }

  async encodeEmailToken(email: string, id: number): Promise<string> {
    try {
      this.logger.debug(`Encode email token`);

      const payload = {
        sub: email,
        id: id,
      };

      return await this.jwtService.signAsync(payload, {
        secret: process.env.TK_EMAIL_SECRET,
        expiresIn: process.env.TK_EMAIL_LIFETIME,
      });
    } catch (error) {
      handleError(error);
    }
  }
}
