import { classes } from '@automapper/classes';
import {
  createMapper,
  CamelCaseNamingConvention,
  SnakeCaseNamingConvention,
} from '@automapper/core';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleEnum, StatusEnum } from '@prisma/client';
import { any, anyObject, anyString } from 'jest-mock-extended';
import { AuthRepository } from 'src/auth/auth.repository';
import { AuthService } from 'src/auth/auth.service';
import { EmailService } from 'src/modules/email/email.service';
import { UserEntity } from 'src/modules/user/entity/user.entity';
import { UserMapping } from 'src/modules/user/user.mapping';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserService } from 'src/modules/user/user.service';
import { hashData } from 'src/utils/hash';

import { ChangePasswordByRecovery } from './dto/request/change-password-by-recovery.dto';
import { LoginDto } from './dto/request/login.dto';
import { UserToken } from './dto/response/UserToken';
import { UserPayload } from './models/UserPayload';

describe('AuthService', () => {
  let userService: UserService;
  let authService: AuthService;
  let userRepositoryMock: jest.Mocked<UserRepository>;
  let authRepositoryMock: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserMapping,
        JwtService,
        AuthService,
        EmailService,
        {
          provide: UserRepository,
          useFactory: () => ({
            createAsync: jest.fn(),
            deleteAsync: jest.fn(),
            updateAsync: jest.fn(),
            exists: jest.fn(),
            findBy: jest.fn(),
            findByIdAsync: jest.fn(),
            findFilteredAsync: jest.fn(),
            findByEmail: jest.fn(),
            updateUserPassword: jest.fn(),
            updateUserPersonalData: jest.fn(),
          }),
        },
        {
          provide: AuthRepository,
          useFactory: () => ({
            updateRefreshToken: jest.fn(() => Promise.resolve()),
          }),
        },
        {
          provide: getMapperToken(),
          useValue: createMapper({
            strategyInitializer: classes(),
          }),
          useFactory: () => ({
            map: jest.fn(),
            mapArray: jest.fn(),
          }),
        },
      ],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
          namingConventions: {
            source: new CamelCaseNamingConvention(),
            destination: new SnakeCaseNamingConvention(),
          },
        }),
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);

    userRepositoryMock = module.get(UserRepository);
    authRepositoryMock = module.get(AuthRepository);
  });

  beforeEach(() => {
    authService.updateRt = jest.fn(() => Promise.resolve());
    authService.sendRegistrationEmail = jest.fn(() => Promise.resolve());
    authService.sendEmailRecovery = jest.fn(() => Promise.resolve());
  });

  describe('Login > Validate User', () => {
    it('Should validate user successfully', async () => {
      /*
    Cenário: Login
    Should return a status 200 and the JWT access and refresh in the body

    Given que o usuário inseriu no campo email o valor "email@gmail.com" 
    And o usuário inseriu no campo senha o valor "teste",
    And existe um usuário no sistema com o email "email@gmail.com" e com a senha "teste",
    And o campo "status" do usuário está como "ACTIVE",
    When clica em “Fazer login no sistema”,
    Then o usuário deve ser redirecionado para a página inicial da aplicação autenticado
    And deve receber a token de acesso na resposta da requisição
    And deve receber a token de refresh na resposta da requisição
    */

      // Given
      const userEmail = 'email@gmail.com';
      const userPassword = 'teste';

      const existingUser: UserEntity = {
        id: 1,
        name: 'administrador cliente',
        email: userEmail,
        password: await hashData(userPassword),
        refreshToken: null,
        recoveryPasswordToken: '',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StatusEnum.ACTIVE,
        Media: null,
        mediaId: null,
        role: RoleEnum.CUSTOMER,
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(existingUser);

      // When
      const validatedUser = await authService.validateUser(
        userEmail,
        userPassword,
      );

      // Then
      expect(validatedUser).toBeDefined();
      expect(validatedUser.email).toEqual(userEmail);
      expect(validatedUser.status).toEqual(StatusEnum.ACTIVE);
    });

    it('Should throw UnauthorizedException if user is not found', async () => {
      // Given
      const userEmail = 'email@gmail.com';
      const userPassword = 'teste';

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      // When
      const validateUser = async () =>
        await authService.validateUser(userEmail, userPassword);

      // Then
      await expect(validateUser).rejects.toThrow(UnauthorizedException);
    });

    it('Should throw UnauthorizedException if user is inactive', async () => {
      /*
      Cenário: Login com um usuário inativo
      Should throw an forbidden exception

      Given que o usuário inseriu no campo email o valor "email@gmail.com" 
        And o usuário inseriu no campo senha o valor "teste",
        And existe um usuário no sistema com o email "email@gmail.com" e com a senha "teste",
        And o campo "status" do usuário está como "INACTIVE",
      When tenta fazer login no sistema,
      Then deve lançar uma exceção de proibido (Forbidden).
        And o usuário deve se manter na tela de login
        And o usuário deve ver uma mensagem de “Usuário inativo”
      */

      // Given
      const userEmail = 'email@gmail.com';
      const userPassword = 'teste';

      const inactiveUser: UserEntity = {
        id: 1,
        name: 'administrador cliente',
        email: userEmail,
        password: await hashData(userPassword),
        refreshToken: null,
        recoveryPasswordToken: '',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StatusEnum.INACTIVE,
        Media: null,
        mediaId: null,
        role: RoleEnum.CUSTOMER,
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(inactiveUser);

      // When
      const validateUser = async () =>
        await authService.validateUser(userEmail, userPassword);

      // Then
      await expect(validateUser).rejects.toThrow(UnauthorizedException);
    });

    it('Should throw UnauthorizedException if password is invalid', async () => {
      /*
      Cenário: Login com um email/senha inválido
      Should throw an unauthorized exception

      Given que o usuário inseriu no campo email o valor "email@gmail.com" 
        And o usuário inseriu no campo senha o valor "teste@123",
        And não existe um usuário no sistema com o email "email@gmail.com",
      When clica em “Fazer login no sistema”,
      Then o usuário deve ver uma mensagem de “Login ou senha incorreta”
        And o usuário deve se manter na tela de login
        And o usuário recebe uma mensagem de não autorizado "Email ou senha incorretos"
      */

      // Given
      const userEmail = 'email@gmail.com';
      const userPassword = 'validPassword';

      const existingUser: UserEntity = {
        id: 1,
        name: 'administrador cliente',
        email: userEmail,
        password: await hashData(userPassword),
        refreshToken: null,
        recoveryPasswordToken: '',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StatusEnum.ACTIVE,
        Media: null,
        mediaId: null,
        role: RoleEnum.CUSTOMER,
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(existingUser);

      // When
      const wrongUserPassword = 'invalidpassword';
      const validateUser = async () =>
        await authService.validateUser(userEmail, wrongUserPassword);

      // Then
      await expect(validateUser).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Login', () => {
    /*
    Cenário: Login
    Should return a status 200 and the JWT access and refresh in the body

    Given que o usuário inseriu no campo email o valor "email@gmail.com" 
    And o usuário inseriu no campo senha o valor "teste",
    And existe um usuário no sistema com o email "email@gmail.com" e com a senha "teste",
    And o campo "status" do usuário está como "ACTIVE",
    When clica em “Fazer login no sistema”,
    Then o usuário deve ser redirecionado para a página inicial da aplicação autenticado
    And deve receber a token de acesso na resposta da requisição
    And deve receber a token de refresh na resposta da requisição
    */

    it('Should return tokens for a valid user', async () => {
      // Given
      const userEmail = 'email@gmail.com';
      const userPassword = 'teste';
      const user: UserEntity = {
        id: 1,
        name: 'User Test',
        email: userEmail,
        password: await hashData(userPassword),
        refreshToken: null,
        recoveryPasswordToken: '',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StatusEnum.ACTIVE,
        Media: null,
        mediaId: null,
        role: null,
      };
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);

      const loginDto: LoginDto = {
        email: userEmail,
        password: userPassword,
      };

      // When
      const tokens: UserToken = await authService.login(loginDto);

      // Then
      expect(tokens).toBeDefined();
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });

    it('Should throw an error for an invalid user', async () => {
      // Given
      const userEmail = 'email@gmail.com';
      const userPassword = 'invalidpassword';
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      const loginDto: LoginDto = {
        email: userEmail,
        password: userPassword,
      };

      // When
      const login = async () => await authService.login(loginDto);

      // Then
      await expect(login).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Recovery password', () => {
    it('Should send an email with the recovery password link', async () => {
      /*
      Cenário: Solicitar recuperação de senha
      Given que o usuário inseriu o valor "email@gmail.com" no campo de email
        And No sistema existe um usuário com o campo email com o valor "email@gmail.com"
      When ele clica em “Recuperar senha”
      Then ele deve ver uma mensagem de “Se o e mail existir, você receberá instruções de recuperação na sua caixa de email”
      */

      // Given
      const userEmail = 'email@gmail.com';

      const user: UserEntity = {
        id: 1,
        name: 'User Test',
        email: userEmail,
        password: await hashData('random'),
        refreshToken: null,
        recoveryPasswordToken: '',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StatusEnum.ACTIVE,
        Media: null,
        mediaId: null,
        role: null,
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);

      // When
      const dto = { email: userEmail };
      await authService.sendRecoveryPasswordEmail(dto);

      // Then
      expect(userService.findByEmail).toHaveBeenCalledWith(userEmail);
      expect(userRepositoryMock.updateAsync).toHaveBeenCalled();
      expect(authService.sendEmailRecovery).toHaveBeenCalledWith(any(), user);
    });

    it('Should change the user password by recovery token', async () => {
      /*
      Cenário: Trocar a senha com a token de recuperação válida
      Should change the password from the token’s user 

      Given que o usuário tem uma token de recuperação com o valor "192x7x8asjdjas89d8"
        And o sistema tem a token de recuperação com o valor "192x7x8asjdjas89d8" atrelado ao email "email@gmail.com"
        And o usuário inseriu no campo senha o valor "Senha@8858"
      When o usuário clica em “Trocar senha”
      Then a senha do usuário atrelado a token de recuperação é modificada
        And o usuário ver uma mensagem de sucesso na tela “Senha trocada com sucesso”
        And o usuário é redirecionado para a tela de login
      */

      // Given
      const userEmail = 'email@gmail.com';
      const recoveryPasswordToken = 'recoveryPasswordToken';
      const newPassword = 'Senha@8858';
      const hashedNewPassword = await hashData(newPassword);

      const userId = 1;

      const currentUser: UserPayload = {
        id: userId,
        email: userEmail,
        sub: userEmail,
        name: 'cliente',
        role: RoleEnum.CUSTOMER,
        status: StatusEnum.ACTIVE,
        createdAt: new Date().toString(),
        iat: 0,
        exp: 0,
      };

      const userFindBy: UserEntity = {
        id: userId,
        name: 'administrador cliente',
        email: userEmail,
        password: await hashData('mockPassword'),
        refreshToken: null,
        recoveryPasswordToken: await hashData(recoveryPasswordToken),
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StatusEnum.ACTIVE,
        Media: null,
        mediaId: null,
        role: RoleEnum.CUSTOMER,
      };

      jest
        .spyOn(authService, 'decodeEmailToken')
        .mockResolvedValue(currentUser);

      jest.spyOn(userService, 'findBy').mockResolvedValue(userFindBy);

      jest
        .spyOn(userRepositoryMock, 'updateUserPassword')
        .mockResolvedValue(Promise.resolve());

      // When
      const dto: ChangePasswordByRecovery = {
        recoveryToken: recoveryPasswordToken,
        newPassword,
      };
      await authService.changePasswordByRecovery(dto);

      // Then
      expect(authService.decodeEmailToken).toHaveBeenCalledWith(
        recoveryPasswordToken,
      );

      expect(userService.findBy).toHaveBeenCalledWith(
        { email: userEmail },
        anyObject(),
      );

      expect(userRepositoryMock.updateUserPassword).toHaveBeenCalledWith(
        userId,
        anyString(),
      );
    });
  });
});
