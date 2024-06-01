import {
  Body,
  Controller,
  Get,
  Patch,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UserCreateDto } from 'src/modules/user/dto/request/user.create.dto';
import { ApiExceptionResponse } from 'src/utils/swagger-schemas/SwaggerSchema';

import { AuthService } from './auth.service';
import { AuthenticatedUser } from './decorators/current-user.decorator';
import { IsPublic } from './decorators/is-public.decorator';
import { ChangePasswordByRecovery } from './dto/request/change-password-by-recovery.dto';
import { EmailDto } from './dto/request/email.dto';
import { LoginDto } from './dto/request/login.dto';
import { UserRegisteredResponse, UserToken } from './dto/response/UserToken';
import { AtGuard, LocalAuthGuard, RtGuard } from './guards';
import { UserPayload } from './models/UserPayload';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Create customer user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: UserRegisteredResponse,
  })
  @ApiBody({ type: UserCreateDto })
  @ApiExceptionResponse()
  @Post('register')
  @IsPublic()
  protected async registerAsync(
    @Res() response: Response,
    @Body() dto: UserCreateDto,
  ) {
    const data = await this.authService.register(dto);

    return response.status(HttpStatus.CREATED).json(data.id);
  }

  @ApiOperation({ summary: 'Forgot Password' })
  @Post('forgot/password')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Res() response: Response, @Body() dto: EmailDto) {
    await this.authService.sendRecoveryPasswordEmail(dto);

    return response.status(HttpStatus.OK).send();
  }

  @ApiOperation({ summary: 'Change password by recovery' })
  @Patch('recovery/password')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  async changePasswordByRecovery(
    @Res() response: Response,
    @Body() dto: ChangePasswordByRecovery,
  ) {
    await this.authService.changePasswordByRecovery(dto);

    return response.status(HttpStatus.OK).send();
  }

  @ApiOperation({ summary: 'Email Availability' })
  @Post('email/availability')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async checkEmailAvailability(
    @Body() dto: EmailDto,
    @Res() response: Response,
  ) {
    const checkEmail = await this.authService.checkEmailAvailability(dto);

    return response.status(HttpStatus.OK).json({
      available: checkEmail,
    });
  }

  @ApiOperation({ summary: 'Login' })
  @Post('login')
  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserToken,
  })
  async login(@Res() response: Response, @Body() dto: LoginDto) {
    const loginResponse = await this.authService.login(dto);

    return response.status(HttpStatus.OK).json(loginResponse);
  }

  @ApiOperation({ summary: 'Refresh Token' })
  @Get('refresh')
  @IsPublic()
  @UseGuards(RtGuard)
  @ApiResponse({ status: HttpStatus.OK, type: UserToken })
  @ApiBearerAuth()
  async refresh(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
  ) {
    const refreshResponse = await this.authService.refreshToken(currentUser);

    return response.status(HttpStatus.OK).json(refreshResponse);
  }

  @ApiOperation({ summary: 'Current user information' })
  @UseGuards(AtGuard)
  @ApiResponse({ status: HttpStatus.OK, type: UserPayload })
  @Get('me')
  @ApiBearerAuth()
  async getMe(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
  ) {
    const usuarioDB = await this.authService.getMe(currentUser);

    return response.status(HttpStatus.OK).json(usuarioDB);
  }
}
