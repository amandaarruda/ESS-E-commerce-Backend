import { classes } from '@automapper/classes';
import {
  createMapper,
  CamelCaseNamingConvention,
  SnakeCaseNamingConvention,
} from '@automapper/core';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleEnum, StatusEnum } from '@prisma/client';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { any, anyObject, anyString } from 'jest-mock-extended';
import { AuthRepository } from 'src/auth/auth.repository';
import { AuthService } from 'src/auth/auth.service';
import { ChangePasswordByRecovery } from 'src/auth/dto/request/change-password-by-recovery.dto';
import { LoginDto } from 'src/auth/dto/request/login.dto';
import { UserToken } from 'src/auth/dto/response/UserToken';
import { UserPayload } from 'src/auth/models/UserPayload';
import { EmailService } from 'src/modules/email/email.service';
import { UpdateUserPassword } from 'src/modules/user/dto/request/update.personal.password.dto';
import { UserCreateDto } from 'src/modules/user/dto/request/user.create.dto';
import { UserEntity } from 'src/modules/user/entity/user.entity';
import { UserMapping } from 'src/modules/user/user.mapping';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserService } from 'src/modules/user/user.service';
import { hashData } from 'src/utils/hash';

import { UpdateUserPersonalData } from './dto/request/update.personal.data.dto';

const feature = loadFeature('features/users.feature');

defineFeature(feature, test => {
  let userService: UserService;
  let authService: AuthService;
  let userRepositoryMock: jest.Mocked<UserRepository>;

  beforeAll(async () => {
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
  });

  beforeEach(() => {
    jest.resetAllMocks();

    authService.updateRt = jest.fn(() => Promise.resolve());
    authService.sendRegistrationEmail = jest.fn(() => Promise.resolve());
    authService.sendEmailRecovery = jest.fn(() => Promise.resolve());
  });

  test('Criar um novo usuário com sucesso', ({ given, when, then }) => {
    let result: UserEntity;

    const userName = 'cliente cadastro';
    const userEmail = 'cliente@gmail.com';
    const userPassword = 'Senha@1238';
    const userRole = RoleEnum.CUSTOMER;

    const createUserDto: UserCreateDto = {
      email: '',
      name: '',
      password: '',
    };

    given(
      'que não existe um usuário com o email "cliente@gmail.com"',
      async () => {
        userRepositoryMock.exists.mockResolvedValue(Promise.resolve(false));
      },
    );

    given(
      'o dado de criação do usuário contém o nome "cliente cadastro", o email "cliente@gmail.com" e a senha "Senha@1238"',
      () => {
        createUserDto.name = userName;
        createUserDto.email = userEmail;
        createUserDto.password = userPassword;
      },
    );

    when('o serviço de autenticação registra o usuário', async () => {
      const mockReturn: UserEntity = {
        id: 1,
        name: userName,
        email: userEmail,
        password: await hashData(userPassword),
        refreshToken: null,
        recoveryPasswordToken: '',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        status: StatusEnum.ACTIVE,
        Media: null,
        mediaId: null,
        role: userRole,
      };

      userRepositoryMock.createAsync.mockResolvedValue(
        Promise.resolve(mockReturn),
      );

      result = await authService.register(createUserDto);
    });

    then(
      'o usuário deve ser criado com nome "cliente cadastro" e email "cliente@gmail.com"',
      () => {
        expect(result).toEqual(
          expect.objectContaining({
            password: expect.any(String),
            email: userEmail,
            name: userName,
          }),
        );
      },
    );

    then('o status do usuário deve ser "ACTIVE"', () => {
      expect(result.status).toBe(StatusEnum.ACTIVE);
    });

    then(
      'o repositório de usuários deve verificar a existência de um usuário com o email "cliente@gmail.com"',
      () => {
        expect(userRepositoryMock.exists).toHaveBeenCalledWith({
          email: userEmail,
        });
      },
    );

    then(
      'o repositório de usuários deve criar o usuário com nome "cliente cadastro", email "cliente@gmail.com" e status "ACTIVE"',
      () => {
        expect(userRepositoryMock.createAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            name: userName,
            email: userEmail,
            status: StatusEnum.ACTIVE,
            role: RoleEnum.CUSTOMER,
          }),
        );
      },
    );
  });

  test('Tentar registrar um usuário com um email já utilizado', ({
    given,
    when,
    then,
  }) => {
    const userName = 'cliente cadastro';
    const userEmail = 'cliente@gmail.com';
    const userPassword = 'Senha@1238';

    const createUserDto: UserCreateDto = {
      email: '',
      name: '',
      password: '',
    };

    given(
      'que já existe um usuário com o email "cliente123@gmail.com"',
      async () => {
        userRepositoryMock.exists.mockResolvedValue(Promise.resolve(true));
      },
    );

    given(
      'o dado de criação do usuário contém o nome "cliente cadastro", o email "cliente@gmail.com" e a senha "Senha@1238"',
      () => {
        createUserDto.name = userName;
        createUserDto.email = userEmail;
        createUserDto.password = userPassword;
      },
    );

    let createUser = () => {};
    when('o serviço de autenticação tenta registrar o usuário', async () => {
      createUser = async () => await authService.register(createUserDto);
    });

    then('deve lançar uma ConflictException', async () => {
      await expect(createUser).rejects.toThrow(ConflictException);
      expect(userRepositoryMock.exists).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
    });
  });

  test('Definir o status do usuário como "Inativo"', ({
    given,
    when,
    then,
  }) => {
    let id: number;
    const userEmail = 'cliente123@gmail.com';

    given(
      'existe um usuário com o ID 1 e email "cliente123@gmail.com" com status "ACTIVE"',
      async () => {
        const userToUpdate: UserEntity = {
          id: 1,
          name: 'cliente cadastro',
          email: userEmail,
          password: await hashData('mockValue'),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: null,
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.CUSTOMER,
        };

        userRepositoryMock.findByEmail.mockResolvedValue(userToUpdate);
        userRepositoryMock.exists.mockResolvedValue(Promise.resolve(true));
        userRepositoryMock.deleteAsync.mockResolvedValue(Promise.resolve());
        userRepositoryMock.findByIdAsync.mockResolvedValue(userToUpdate);
      },
    );

    given('o ID do usuário a ser deletado é 1', () => {
      id = 1;
    });

    when('o serviço de usuário deleta o usuário', async () => {
      await userService.deleteAsync(id);
    });

    then('o repositório de usuários deve encontrar o usuário pelo ID 1', () => {
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(id);
    });

    then(
      'o repositório de usuários deve verificar a existência do usuário com ID 1',
      () => {
        expect(userRepositoryMock.exists).toHaveBeenCalledWith({ id });
      },
    );

    then('o repositório de usuários deve deletar o usuário com ID 1', () => {
      expect(userRepositoryMock.deleteAsync).toHaveBeenCalledWith(id);
    });
  });

  test('Tentar deletar um usuário já inativo', ({ given, when, then }) => {
    let id: number;
    const userEmail = 'cliente123@gmail.com';

    given(
      'existe um usuário com o ID 1 e email "cliente123@gmail.com" com status "INACTIVE"',
      async () => {
        const inactiveUser: UserEntity = {
          id: 1,
          name: 'cliente cadastro',
          email: userEmail,
          password: await hashData('mockValue'),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: new Date(),
          createdAt: new Date(),
          updatedAt: null,
          status: StatusEnum.INACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.CUSTOMER,
        };

        userRepositoryMock.exists.mockResolvedValue(Promise.resolve(true));
        userRepositoryMock.findByIdAsync.mockResolvedValue(inactiveUser);
      },
    );

    given('o ID do usuário a ser deletado é 1', () => {
      id = 1;
    });

    when('o serviço de usuário tenta deletar o usuário', async () => {
      const deleteUser = async () => await userService.deleteAsync(id);
      await expect(deleteUser).rejects.toThrow(ForbiddenException);
    });

    then('deve lançar uma ForbiddenException', () => {
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(id);
    });
  });

  test('Tentar deletar um usuário que não existe', ({ given, when, then }) => {
    let id: number;

    given('o ID do usuário a ser deletado é 1', () => {
      id = 1;
    });

    given('o usuário com ID 1 não existe', async () => {
      userRepositoryMock.exists.mockResolvedValue(false);
    });

    let deleteUser = () => {};

    when('o serviço de usuário tenta deletar o usuário', async () => {
      deleteUser = async () => await userService.deleteAsync(id);
    });

    then('deve lançar uma NotFoundException', async () => {
      await expect(deleteUser).rejects.toThrow(NotFoundException);
      expect(userRepositoryMock.exists).toHaveBeenCalledWith({ id });
    });
  });

  test('Atualizar os dados de registro do usuário logado', ({
    given,
    when,
    then,
  }) => {
    let currentUser: UserPayload;
    let updatedName: string;

    given(
      'existe um usuário logado com ID 1 e email "cliente123@gmail.com"',
      () => {
        currentUser = {
          id: 1,
          email: 'cliente123@gmail.com',
          sub: 'cliente123@gmail.com',
          name: 'cliente',
          role: RoleEnum.CUSTOMER,
          status: StatusEnum.ACTIVE,
          createdAt: new Date().toString(),
          iat: 0,
          exp: 0,
        };
      },
    );

    given('o nome atualizado do usuário é "cliente atualizado"', () => {
      updatedName = 'cliente atualizado';
    });

    given(
      'o dado de atualização dos dados pessoais contém "cliente atualizado"',
      async () => {
        const existingUser: UserEntity = {
          id: 1,
          name: 'administrador cliente',
          email: 'cliente123@gmail.com',
          password: await hashData('mockValue'),
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

        userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
        userRepositoryMock.updateAsync.mockResolvedValue({
          ...existingUser,
          name: updatedName,
        });
      },
    );

    when(
      'o serviço de usuário atualiza os dados pessoais do usuário logado',
      async () => {
        const updateUserPersonalDataDto = { name: updatedName };
        await userService.updateUserPersonalData(
          updateUserPersonalDataDto,
          currentUser,
        );
      },
    );

    then('o repositório de usuários deve encontrar o usuário pelo ID 1', () => {
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(
        currentUser.id,
      );
    });

    then(
      'o repositório de usuários deve atualizar o usuário com nome "cliente atualizado"',
      () => {
        expect(userRepositoryMock.updateAsync).toHaveBeenCalledWith(
          currentUser.id,
          {
            name: updatedName,
          },
        );
      },
    );
  });

  test('Não atualizar se nenhum dado for fornecido', ({
    given,
    when,
    then,
  }) => {
    let currentUser: UserPayload;
    let updateUserPersonalDataDto: UpdateUserPersonalData;

    given(
      'existe um usuário logado com ID 1 e email "cliente123@gmail.com"',
      () => {
        currentUser = {
          id: 1,
          email: 'cliente123@gmail.com',
          sub: 'cliente123@gmail.com',
          name: 'cliente',
          role: RoleEnum.CUSTOMER,
          status: StatusEnum.ACTIVE,
          createdAt: new Date().toString(),
          iat: 0,
          exp: 0,
        };
      },
    );

    given('o dado de atualização dos dados pessoais está vazio', () => {
      updateUserPersonalDataDto = {};
    });

    when(
      'o serviço de usuário tenta atualizar os dados pessoais do usuário logado',
      async () => {
        await userService.updateUserPersonalData(
          updateUserPersonalDataDto,
          currentUser,
        );
      },
    );

    then(
      'o repositório de usuários não deve ser chamado para encontrar o usuário',
      () => {
        expect(userRepositoryMock.findByIdAsync).not.toHaveBeenCalled();
      },
    );

    then(
      'o repositório de usuários não deve ser chamado para atualizar o usuário',
      () => {
        expect(userRepositoryMock.updateAsync).not.toHaveBeenCalled();
      },
    );
  });

  test('Lançar erro se o usuário não for encontrado', ({
    given,
    when,
    then,
  }) => {
    let currentUser: UserPayload;
    const updatedName = 'cliente normal';

    given('o ID do usuário logado é 1', () => {
      currentUser = {
        id: 1,
        email: 'cliente123@gmail.com',
        sub: 'cliente123@gmail.com',
        name: 'cliente',
        role: RoleEnum.CUSTOMER,
        status: StatusEnum.ACTIVE,
        createdAt: new Date().toString(),
        iat: 0,
        exp: 0,
      };
    });

    given('o nome atualizado do usuário é "cliente normal"', () => {
      currentUser.name = updatedName;
    });

    let updateUserPersonalDataDto: UpdateUserPersonalData;
    given(
      'o dado de atualização dos dados pessoais contém "cliente normal"',
      () => {
        updateUserPersonalDataDto = {
          name: updatedName,
        };
      },
    );

    given('o usuário com ID 1 não existe', async () => {
      userRepositoryMock.findByIdAsync.mockResolvedValue(null);
    });

    let updateUser = () => {};

    when(
      'o serviço de usuário tenta atualizar os dados pessoais do usuário logado',
      async () => {
        updateUser = async () =>
          await userService.updateUserPersonalData(
            updateUserPersonalDataDto,
            currentUser,
          );
      },
    );

    then('deve lançar uma NotFoundException', async () => {
      await expect(updateUser).rejects.toThrow(NotFoundException);
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(
        currentUser.id,
      );
    });
  });

  test('Lançar erro se o usuário estiver inativo ou deletado', ({
    given,
    when,
    then,
  }) => {
    let currentUser: UserPayload;
    const updatedName = 'cliente normal';

    given('o ID do usuário logado é 1', () => {
      currentUser = {
        id: 1,
        email: 'cliente123@gmail.com',
        sub: 'cliente123@gmail.com',
        name: 'cliente',
        role: RoleEnum.CUSTOMER,
        status: StatusEnum.ACTIVE,
        createdAt: new Date().toString(),
        iat: 0,
        exp: 0,
      };
    });

    given('o nome atualizado do usuário é "cliente normal"', () => {
      currentUser.name = updatedName;
    });

    let updateUserPersonalDataDto: UpdateUserPersonalData;
    given(
      'o dado de atualização dos dados pessoais contém "cliente normal"',
      () => {
        updateUserPersonalDataDto = {
          name: updatedName,
        };
      },
    );

    given('o usuário com ID 1 está inativo ou deletado', async () => {
      const inactiveUser: UserEntity = {
        id: 1,
        name: 'administrador cliente',
        email: 'cliente123@gmail.com',
        password: await hashData('mockValue'),
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

      userRepositoryMock.findByIdAsync.mockResolvedValue(inactiveUser);
    });

    let updateUser = () => {};

    when(
      'o serviço de usuário tenta atualizar os dados pessoais do usuário logado',
      async () => {
        updateUser = async () =>
          await userService.updateUserPersonalData(
            updateUserPersonalDataDto,
            currentUser,
          );
      },
    );

    then('deve lançar uma ForbiddenException', async () => {
      await expect(updateUser).rejects.toThrow(ForbiddenException);

      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(
        currentUser.id,
      );
    });
  });

  test('Atualizar a senha do usuário logado', ({ given, when, then }) => {
    let currentUser: UserPayload;
    let currentPassword: string;
    let newPassword: string;

    given(
      'existe um usuário logado com ID 1 e email "cliente123@gmail.com"',
      () => {
        currentUser = {
          id: 1,
          email: 'cliente123@gmail.com',
          sub: 'cliente123@gmail.com',
          name: 'cliente',
          role: RoleEnum.CUSTOMER,
          status: StatusEnum.ACTIVE,
          createdAt: new Date().toString(),
          iat: 0,
          exp: 0,
        };
      },
    );

    given('a senha atual é "Senha@123"', () => {
      currentPassword = 'Senha@123';
    });

    given('a nova senha é "Senha@8858"', () => {
      newPassword = 'Senha@8858';
    });

    given(
      'o dado de atualização de senha contém "Senha@123" e "Senha@8858"',
      async () => {
        const currentPasswordHashed = await hashData(currentPassword);
        const existingUser: UserEntity = {
          id: 1,
          name: 'Administrador',
          email: 'administrador123@gmail.com',
          password: currentPasswordHashed,
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.ADMIN,
        };

        userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
        userRepositoryMock.updateUserPassword.mockResolvedValue(
          Promise.resolve(),
        );
      },
    );

    when(
      'o serviço de usuário atualiza a senha do usuário logado',
      async () => {
        const updateUserPasswordDto: UpdateUserPassword = {
          actualPassword: currentPassword,
          newPassword: newPassword,
        };
        await userService.updateUserPassword(
          updateUserPasswordDto,
          currentUser,
        );
      },
    );

    then('o repositório de usuários deve encontrar o usuário pelo ID 1', () => {
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(
        currentUser.id,
      );
    });

    then('o repositório de usuários deve atualizar a senha do usuário', () => {
      expect(userRepositoryMock.updateUserPassword).toHaveBeenCalledWith(
        currentUser.id,
        expect.any(String),
      );
    });
  });

  test('Lançar erro se a senha atual for a mesma que a nova senha', ({
    given,
    when,
    then,
  }) => {
    let currentUser: UserPayload;
    let password: string;

    given(
      'existe um usuário logado com ID 1 e email "cliente123@gmail.com"',
      () => {
        currentUser = {
          id: 1,
          email: 'cliente123@gmail.com',
          sub: 'cliente123@gmail.com',
          name: 'cliente',
          role: RoleEnum.CUSTOMER,
          status: StatusEnum.ACTIVE,
          createdAt: new Date().toString(),
          iat: 0,
          exp: 0,
        };
      },
    );

    given('a senha atual e a nova senha são "Senha@123"', () => {
      password = 'Senha@123';
    });

    let updateUserPasswordDto: UpdateUserPassword;
    given(
      'o dado de atualização de senha contém "Senha@123" e "Senha@123"',
      () => {
        updateUserPasswordDto = {
          actualPassword: password,
          newPassword: password,
        };
      },
    );

    let updateUserPassword = () => {};

    when(
      'o serviço de usuário tenta atualizar a senha do usuário logado',
      async () => {
        updateUserPassword = async () =>
          await userService.updateUserPassword(
            updateUserPasswordDto,
            currentUser,
          );
      },
    );

    then('deve lançar uma BadRequestException', async () => {
      await expect(updateUserPassword).rejects.toThrow(BadRequestException);
      expect(userRepositoryMock.updateUserPassword).not.toHaveBeenCalled();
    });
  });

  test('Lançar erro se a senha atual estiver incorreta', ({
    given,
    when,
    then,
  }) => {
    let currentUser: UserPayload;

    given(
      'existe um usuário logado com ID 1 e email "cliente123@gmail.com"',
      async () => {
        currentUser = {
          id: 1,
          email: 'cliente123@gmail.com',
          sub: 'cliente123@gmail.com',
          name: 'cliente',
          role: RoleEnum.CUSTOMER,
          status: StatusEnum.ACTIVE,
          createdAt: new Date().toString(),
          iat: 0,
          exp: 0,
        };
      },
    );

    let currentPassword: string;
    let wrongPassword: string;
    let newPassword: string;

    given('a senha atual é "Senha@123"', () => {
      currentPassword = 'Senha@123';
    });

    given('a senha incorreta é "SenhaErrada@123"', () => {
      wrongPassword = 'SenhaErrada@123';
    });

    given('a nova senha é "Senha@8858"', () => {
      newPassword = 'Senha@8858';
    });

    let updateUserPasswordDto: UpdateUserPassword;

    given(
      'o dado de atualização de senha contém "SenhaErrada@123" e "Senha@8858"',
      async () => {
        updateUserPasswordDto = {
          actualPassword: wrongPassword,
          newPassword: newPassword,
        };

        const existingUser: UserEntity = {
          id: 1,
          name: 'Administrador',
          email: 'administrador123@gmail.com',
          password: await hashData(currentPassword),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.ADMIN,
        };

        userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
      },
    );

    let updateUserPassword = () => {};

    when(
      'o serviço de usuário tenta atualizar a senha do usuário logado',
      async () => {
        updateUserPassword = async () =>
          await userService.updateUserPassword(
            updateUserPasswordDto,
            currentUser,
          );
      },
    );

    then('deve lançar uma BadRequestException', async () => {
      await expect(updateUserPassword).rejects.toThrow(BadRequestException);
      expect(userRepositoryMock.updateUserPassword).not.toHaveBeenCalled();
    });
  });

  test('Deletar o usuário', ({ given, when, then }) => {
    let userId: number;

    given(
      'existe um usuário com ID 1 e email "cliente123@gmail.com" com status "ACTIVE"',
      async () => {
        const existingUser: UserEntity = {
          id: userId,
          name: 'cliente',
          email: 'cliente123@gmail.com',
          password: await hashData('Senha@123'),
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

        userRepositoryMock.exists.mockResolvedValue(true);
        userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
      },
    );

    given('o ID do usuário a ser deletado é 1', () => {
      userId = 1;
    });

    when('o serviço de usuário deleta o usuário', async () => {
      await userService.deleteAsync(userId);
    });

    then('o repositório de usuários deve deletar o usuário com ID 1', () => {
      expect(userRepositoryMock.deleteAsync).toHaveBeenCalledWith(userId);
    });
  });

  test('Lançar BadRequestException se o ID for nulo', ({ when, then }) => {
    let deleteUser = () => {};
    when(
      'o serviço de usuário tenta deletar um usuário com ID nulo',
      async () => {
        deleteUser = async () => await userService.deleteAsync(null);
      },
    );

    then('deve lançar uma BadRequestException', async () => {
      await expect(deleteUser).rejects.toThrow(BadRequestException);
      expect(userRepositoryMock.deleteAsync).not.toHaveBeenCalled();
    });
  });

  test('Lançar NotFoundException se o usuário não existir', ({
    given,
    when,
    then,
  }) => {
    let userId: number;

    given('o ID do usuário a ser deletado é 1', () => {
      userId = 1;
    });

    given('o usuário com ID 1 não existe', async () => {
      userRepositoryMock.exists.mockResolvedValue(false);
    });

    let deleteUser = () => {};

    when('o serviço de usuário tenta deletar o usuário', async () => {
      deleteUser = async () => await userService.deleteAsync(userId);
    });

    then('deve lançar uma NotFoundException', async () => {
      await expect(deleteUser).rejects.toThrow(NotFoundException);
      expect(userRepositoryMock.exists).toHaveBeenCalledWith({ id: userId });
    });
  });

  test('Lançar ForbiddenException se o usuário já estiver inativo', ({
    given,
    when,
    then,
  }) => {
    let userId: number;

    given(
      'existe um usuário com ID 1 e email "cliente123@gmail.com" com status "INACTIVE"',
      async () => {
        const existingUser: UserEntity = {
          id: 1,
          name: 'cliente',
          email: 'cliente123@gmail.com',
          password: await hashData('Senha@123'),
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

        userRepositoryMock.exists.mockResolvedValue(true);
        userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
      },
    );

    given('o ID do usuário a ser deletado é 1', () => {
      userId = 1;
    });

    let deleteUser = () => {};

    when('o serviço de usuário tenta deletar o usuário', async () => {
      deleteUser = async () => await userService.deleteAsync(userId);
    });

    then('deve lançar uma ForbiddenException', async () => {
      await expect(deleteUser).rejects.toThrow(ForbiddenException);
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(userId);
    });
  });

  test('Lançar ForbiddenException se o usuário for um administrador', ({
    given,
    when,
    then,
  }) => {
    let userId: number;

    given(
      'existe um usuário com ID 1 e email "admin@gmail.com" com status "ACTIVE" e papel "ADMIN"',
      async () => {
        const existingUser: UserEntity = {
          id: 1,
          name: 'admin',
          email: 'admin@gmail.com',
          password: await hashData('Senha@123'),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.ADMIN,
        };

        userRepositoryMock.exists.mockResolvedValue(true);
        userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
      },
    );

    given('o ID do usuário a ser deletado é 1', () => {
      userId = 1;
    });

    let deleteUser = () => {};
    when('o serviço de usuário tenta deletar o usuário', async () => {
      deleteUser = async () => await userService.deleteAsync(userId);
    });

    then('deve lançar uma ForbiddenException', async () => {
      await expect(deleteUser).rejects.toThrow(ForbiddenException);
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(userId);
    });
  });

  test('Validar usuário com sucesso', ({ given, when, then }) => {
    let userEmail: string;
    let userPassword: string;
    let result;

    given(
      'que o usuário inseriu no campo email o valor "email@gmail.com"',
      () => {
        userEmail = 'email@gmail.com';
      },
    );

    given('o usuário inseriu no campo senha o valor "teste"', () => {
      userPassword = 'teste';
    });

    given(
      'existe um usuário no sistema com o email "email@gmail.com" e com a senha "teste"',
      async () => {
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
      },
    );

    when('tenta logar no sistema', async () => {
      result = await authService.validateUser(userEmail, userPassword);
    });

    then(
      'o usuário deve receber o próprio usuário validado com o email',
      () => {
        expect(result).toBeDefined();
        expect(result.email).toEqual(userEmail);
      },
    );
  });

  test('Lançar UnauthorizedException se o usuário não for encontrado', ({
    given,
    when,
    then,
  }) => {
    let userEmail: string;
    let userPassword: string;

    given(
      'que o usuário inseriu no campo email o valor "email@gmail.com"',
      () => {
        userEmail = 'email@gmail.com';
      },
    );

    given('o usuário inseriu no campo senha o valor "teste"', () => {
      userPassword = 'teste';
    });

    given(
      'não existe um usuário no sistema com o email "email@gmail.com"',
      async () => {
        jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      },
    );

    let validateUser: () => Promise<Omit<UserEntity, 'password'>>;

    when('fazer login no sistema', async () => {
      validateUser = async () =>
        await authService.validateUser(userEmail, userPassword);
    });

    then('deve lançar uma UnauthorizedException', async () => {
      await expect(validateUser).rejects.toThrow(UnauthorizedException);
    });
  });

  test('Lançar UnauthorizedException se o usuário estiver inativo', ({
    given,
    when,
    then,
  }) => {
    let userEmail: string;
    let userPassword: string;

    given(
      'que o usuário inseriu no campo email o valor "email@gmail.com"',
      () => {
        userEmail = 'email@gmail.com';
      },
    );

    given('o usuário inseriu no campo senha o valor "teste"', () => {
      userPassword = 'teste';
    });

    given(
      'existe um usuário inativo no sistema com o email "email@gmail.com" e com a senha "teste"',
      async () => {
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
      },
    );

    let validateUser: () => Promise<Omit<UserEntity, 'password'>>;

    when('tenta fazer login no sistema', async () => {
      validateUser = async () =>
        await authService.validateUser(userEmail, userPassword);
    });

    then('deve lançar uma UnauthorizedException', async () => {
      await expect(validateUser).rejects.toThrow(UnauthorizedException);
    });
  });

  test('Lançar UnauthorizedException se a senha for inválida', ({
    given,
    when,
    then,
  }) => {
    let userEmail: string;
    let userPassword: string;
    let wrongUserPassword: string;

    given(
      'que o usuário inseriu no campo email o valor "email@gmail.com"',
      () => {
        userEmail = 'email@gmail.com';
      },
    );

    given('o usuário inseriu no campo senha o valor "teste@123"', () => {
      wrongUserPassword = 'teste@123';
    });

    given(
      'não existe um usuário no sistema com o email "email@gmail.com"',
      async () => {
        userPassword = 'teste';

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
      },
    );

    let validateUser: () => Promise<Omit<UserEntity, 'password'>>;

    when('clica em “Fazer login no sistema”', async () => {
      validateUser = async () =>
        await authService.validateUser(userEmail, wrongUserPassword);
    });

    then('deve lançar uma UnauthorizedException', async () => {
      await expect(validateUser).rejects.toThrow(UnauthorizedException);
    });
  });

  test('Login com sucesso', ({ given, when, then }) => {
    let userEmail: string;
    let userPassword: string;
    let tokens: UserToken;

    given(
      'que o usuário inseriu no campo email o valor "email@gmail.com"',
      () => {
        userEmail = 'email@gmail.com';
      },
    );

    given('o usuário inseriu no campo senha o valor "teste"', () => {
      userPassword = 'teste';
    });

    given(
      'existe um usuário no sistema com o email "email@gmail.com" e com a senha "teste"',
      async () => {
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
      },
    );

    when('clica em “Fazer login no sistema”', async () => {
      const loginDto: LoginDto = {
        email: userEmail,
        password: userPassword,
      };
      tokens = await authService.login(loginDto);
    });

    then(
      'o usuário deve ser redirecionado para a página inicial da aplicação autenticado',
      () => {
        expect(tokens).toBeDefined();
      },
    );

    then('deve receber a token de acesso na resposta da requisição', () => {
      expect(tokens.accessToken).toBeDefined();
    });

    then('deve receber a token de refresh na resposta da requisição', () => {
      expect(tokens.refreshToken).toBeDefined();
    });
  });

  test('Solicitar recuperação de senha', ({ given, when, then }) => {
    let userEmail: string;

    given(
      'que o usuário inseriu o valor "email@gmail.com" no campo de email',
      () => {
        userEmail = 'email@gmail.com';
      },
    );

    given(
      'no sistema existe um usuário com o campo email com o valor "email@gmail.com"',
      async () => {
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
      },
    );

    when('usuário solicita a recuperação de senha', async () => {
      const dto = { email: userEmail };
      await authService.sendRecoveryPasswordEmail(dto);
    });

    then(
      'O usuário deve receber um email com um link para recuperação de senha',
      () => {
        expect(userService.findByEmail).toHaveBeenCalledWith(userEmail);
        expect(userRepositoryMock.updateAsync).toHaveBeenCalled();
        expect(authService.sendEmailRecovery).toHaveBeenCalled();
      },
    );
  });

  test('Trocar a senha com a token de recuperação válida', ({
    given,
    when,
    then,
  }) => {
    const userEmail = 'email@gmail.com';
    const userId = 1;
    let recoveryPasswordToken: string;
    let newPassword: string;

    given(
      'que o usuário tem uma token de recuperação com o valor "192x7x8asjdjas89d8"',
      () => {
        recoveryPasswordToken = '192x7x8asjdjas89d8';
      },
    );

    given(
      'o sistema tem a token de recuperação com o valor "192x7x8asjdjas89d8" atrelado ao email "email@gmail.com"',
      async () => {
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
      },
    );

    given('o usuário enviou na senha o valor "Senha@8858"', () => {
      newPassword = 'Senha@8858';
    });

    when('o usuário clica em “Trocar senha”', async () => {
      const dto: ChangePasswordByRecovery = {
        recoveryToken: recoveryPasswordToken,
        newPassword,
      };
      await authService.changePasswordByRecovery(dto);
    });

    then(
      'a senha do usuário atrelado a token de recuperação é modificada',
      () => {
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
      },
    );
  });
});
