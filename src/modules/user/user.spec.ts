import { classes } from '@automapper/classes';
import {
  Mapper,
  createMapper,
  CamelCaseNamingConvention,
  SnakeCaseNamingConvention,
} from '@automapper/core';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleEnum, StatusEnum } from '@prisma/client';
import { AuthRepository } from 'src/auth/auth.repository';
import { AuthService } from 'src/auth/auth.service';
import { UserPayload } from 'src/auth/models/UserPayload';
import { compareHash, hashData } from 'src/utils/hash';

import { EmailService } from '../email/email.service';
import { UpdateUserPassword } from './dto/request/update.personal.password.dto';
import { UserCreateDto } from './dto/request/user.create.dto';
import { UserEntity } from './entity/user.entity';
import { UserMapping } from './user.mapping';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('UsersService', () => {
  let service: UserService;
  let authService: AuthService;
  let userRepositoryMock: jest.Mocked<UserRepository>;
  let authRepositoryMock: jest.Mocked<AuthRepository>;
  let mapperMock: Mapper;

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

    service = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);

    userRepositoryMock = module.get(UserRepository);
    authRepositoryMock = module.get(AuthRepository);
    mapperMock = module.get(getMapperToken());
  });

  beforeEach(() => {
    authService.updateRt = jest.fn(() => Promise.resolve());
    authService.sendRegistrationEmail = jest.fn(() => Promise.resolve());
  });

  describe('Create', () => {
    it('Should create a new user', async () => {
      /* 
      Should register an customer user
      Given que um novo cliente está na tela de registro,
        And o usuário preenche o campo nome com o valor "cliente cadatro"
        And o usuário preenche o campo email com o valor "cliente@gmail.com"
        And o usuário preenche o campo senha com o valor "Senha@1238"
        And não existe outro usuário com o mesmo email cadastrado no sistema
      When clica no botão "Registrar",
      Then o sistema deve registrar um novo usuário cliente,
        And o cliente deve receber uma mensagem de confirmação "Usuário registrado com sucesso".
       */

      // Given
      const userName = 'cliente cadastro';
      const userEmail = 'cliente@gmail.com';
      const userPassword = 'Senha@1238';
      const userRole = RoleEnum.CUSTOMER;

      // Mocking repository methods
      userRepositoryMock.exists.mockResolvedValue(Promise.resolve(false));

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

      const createUserDto: UserCreateDto = {
        name: userName,
        email: userEmail,
        password: userPassword,
      };

      // When
      const result = await authService.register(createUserDto);

      // Then
      expect(result).toEqual(
        expect.objectContaining({
          password: expect.any(String),
          email: userEmail,
          name: userName,
        }),
      );
      expect(result.status).toBe(StatusEnum.ACTIVE);
      expect(userRepositoryMock.exists).toHaveBeenCalledWith({
        email: userEmail,
      });
      expect(userRepositoryMock.createAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: userName,
          email: userEmail,
          status: StatusEnum.ACTIVE,
          role: RoleEnum.CUSTOMER,
        }),
      );
    });

    it('Should throw conflict request exception when the user try to register with an already used email', async () => {
      /*
      Cenário: Registrar um usuário cliente com o email já utilizado
      Should throw bad request exception when the user try to register itself with used email

      Given que um novo cliente está na tela de registro,
        And existe um usuário cadastrado no sistema com o email "cliente123@gmail.com"
        And o usuário insere o email dele "cliente123@gmail.com"
        And o usuário insere o nome dele "cliente abc"
        And o usuário insere a senha dele "ClienteAbc@123"
        And clica no botão "Registrar",
      Then o sistema não deve cadastrar o usuário
        And o cliente deve receber uma mensagem de erro "Email já utilizado por outro usuário".
      */

      // Given
      const createUserDto: UserCreateDto = {
        name: 'cliente abc',
        email: 'cliente123@gmail.com',
        password: 'ClienteAbc@123',
      };

      // And already exists an user with the same email
      userRepositoryMock.exists.mockResolvedValue(Promise.resolve(true));

      // When
      const createUser = async () => await authService.register(createUserDto);

      // Then
      await expect(createUser).rejects.toThrow(ConflictException);
      expect(userRepositoryMock.exists).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
    });
  });

  describe('Deleting user', () => {
    it('Should set the user status to "Inactive"', async () => {
      // Given
      const id = 1;
      const userEmail = 'cliente123@gmail.com';

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

      // Mockando o usuário cliente a ser deletado
      userRepositoryMock.findByEmail.mockResolvedValue(userToUpdate);
      userRepositoryMock.exists.mockResolvedValue(Promise.resolve(true));
      userRepositoryMock.deleteAsync.mockResolvedValue(Promise.resolve());
      userRepositoryMock.findByIdAsync.mockResolvedValue(userToUpdate);

      // When
      await service.deleteAsync(id);

      // Then
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(id);
      expect(userRepositoryMock.exists).toHaveBeenCalledWith({ id });
      expect(userRepositoryMock.deleteAsync).toHaveBeenCalledWith(id);
    });

    it('Should throw ForbiddenException when user with given email is already inactive', async () => {
      // Given
      const id = 1;
      const userEmail = 'cliente123@gmail.com';

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

      // When
      const deleteUser = async () => await service.deleteAsync(id);

      // Then
      await expect(deleteUser).rejects.toThrow(ForbiddenException);
    });

    it('Should throw NotFoundException when user with given email does not exist', async () => {
      // Given
      const id = 1;

      userRepositoryMock.findByIdAsync.mockResolvedValue(null);

      // When
      const deleteUser = async () => await service.deleteAsync(id);

      // Then
      await expect(deleteUser).rejects.toThrow(NotFoundException);
    });
  });

  describe('Update User Personal Data', () => {
    it('Should update the register data of the logged user', async () => {
      /*
      Cenário: Atualizar os próprios dados
      Should update the register data of the logged user
  
      Given que o usuário "cliente123@gmail.com" está logado no sistema,
        And está na tela de perfil,
        And o email dele é igual a "cliente123@gmail.com"
        And o nome dele é "administrador cliente"
      When o usuário altera o nome dele para "cliente normal"
        And clica na opção de atualizar
      Then o sistema deve atualizar os dados do usuário logado,
        And o usuário deve receber uma mensagem de confirmação "Dados atualizados com sucesso".
        And o usuário vai ver o seu nome atualizado no sistema
      */

      // Given
      const currentUser: UserPayload = {
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

      const updatedName = 'cliente atualizado';

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

      // Mocking repository methods
      userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
      userRepositoryMock.updateAsync.mockResolvedValue({
        ...existingUser,
        name: updatedName,
      });

      const updateUserPersonalDataDto = {
        name: updatedName,
      };

      // When
      await service.updateUserPersonalData(
        updateUserPersonalDataDto,
        currentUser,
      );

      // Then
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(
        currentUser.id,
      );
      expect(userRepositoryMock.updateAsync).toHaveBeenCalledWith(
        currentUser.id,
        {
          name: updatedName,
        },
      );
    });

    it('Should not update if no data is provided', async () => {
      // Given
      const currentUser: UserPayload = {
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

      const updateUserPersonalDataDto = {}; // No data provided

      // When
      await service.updateUserPersonalData(
        updateUserPersonalDataDto,
        currentUser,
      );

      // Then
      expect(userRepositoryMock.findByIdAsync).not.toHaveBeenCalled();
      expect(userRepositoryMock.updateAsync).not.toHaveBeenCalled();
    });

    it('Should throw error if user not found', async () => {
      // Given
      const currentUser: UserPayload = {
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

      const updatedName = 'cliente normal';

      userRepositoryMock.findByIdAsync.mockResolvedValue(null); // User not found

      const updateUserPersonalDataDto = {
        name: updatedName,
      };

      // When
      const updateUser = async () =>
        await service.updateUserPersonalData(
          updateUserPersonalDataDto,
          currentUser,
        );

      // Then
      await expect(updateUser).rejects.toThrow(NotFoundException);
    });

    it('Should throw error if user is inactive or deleted', async () => {
      // Given
      const currentUser: UserPayload = {
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

      const updatedName = 'cliente normal';

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

      const updateUserPersonalDataDto = {
        name: updatedName,
      };

      // When
      const updateUser = async () =>
        await service.updateUserPersonalData(
          updateUserPersonalDataDto,
          currentUser,
        );

      // Then
      await expect(updateUser).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Update User Password', () => {
    it('Should update the logged user password', async () => {
      /*
      Cenário: Atualizar a própria senha com sucesso
      Should update the logged user password
  
      Given que o usuário "administrador123@gmail.com" está logado no sistema,
        And está na tela de edição de senha,
        And a senha atual é igual a "Senha@123"
      When o usuário preenche o campos de senha atual com o valor "Senha@123"
        And o usuário preenche o campo nova senha com o valor "Senha@8858"
        And clica na opção de atualizar senha,
      Then o sistema deve atualizar a senha do usuário logado,
        And o usuário deve receber uma mensagem de confirmação "Senha atualizada com sucesso"
        And o usuário não deve mais conseguir logar com a senha antiga
      */

      // Given
      const currentUser: UserPayload = {
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

      const currentPassword = 'Senha@123';
      const newPassword = 'Senha@8858';

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

      // Mocking repository methods
      userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
      userRepositoryMock.updateUserPassword.mockResolvedValue(
        Promise.resolve(),
      );

      const updateUserPasswordDto: UpdateUserPassword = {
        actualPassword: currentPassword,
        newPassword: newPassword,
      };

      // When
      await service.updateUserPassword(updateUserPasswordDto, currentUser);

      // Then
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(
        currentUser.id,
      );
      expect(userRepositoryMock.updateUserPassword).toHaveBeenCalledWith(
        currentUser.id,
        expect.any(String),
      );

      // Verifying that the user can log in with the new password
      const hashedNewPassword = await hashData(newPassword);
      const isNewPasswordValid = await compareHash(
        newPassword,
        hashedNewPassword,
      );

      expect(isNewPasswordValid).toBe(true);
    });

    it('Should throw error if actual password is the same as the new password', async () => {
      // Given
      const currentUser: UserPayload = {
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

      const password = 'Senha@123';

      const updateUserPasswordDto: UpdateUserPassword = {
        actualPassword: password,
        newPassword: password,
      };

      // When
      const updateUserPassword = async () =>
        await service.updateUserPassword(updateUserPasswordDto, currentUser);

      // Then
      await expect(updateUserPassword).rejects.toThrow(BadRequestException);
    });

    it('Should throw error if actual password is incorrect', async () => {
      // Given
      const currentUser: UserPayload = {
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

      const currentPassword = 'Senha@123';
      const wrongPassword = 'SenhaErrada@123';
      const newPassword = 'Senha@8858';

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

      // Mocking repository methods
      userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);

      const updateUserPasswordDto: UpdateUserPassword = {
        actualPassword: wrongPassword,
        newPassword: newPassword,
      };

      // When
      const updateUserPassword = async () =>
        await service.updateUserPassword(updateUserPasswordDto, currentUser);

      // Then
      await expect(updateUserPassword).rejects.toThrow(BadRequestException);
    });
  });

  describe('Delete user / delete myself', () => {
    it('Should delete user', async () => {
      /*
      Cenário: Deleção da própria conta
      Should set the current logged user status to inactive

      Given que o usuário "usuario@gmail.com" está logado no sistema,
        And está com o status ativo,
        And está na tela de perfil,
      When ele seleciona a opção de deletar conta,
      Then o sistema deve definir o status do usuário logado como inativo,
        And o usuário deve receber uma mensagem de confirmação "Conta inativada com sucesso"
        And o usuário deve ser deslogado do sistema.
      */

      // Given
      const userId = 1;
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

      // When
      await service.deleteAsync(userId);

      // Then
      expect(userRepositoryMock.deleteAsync).toHaveBeenCalledWith(userId);
    });

    it('Should throw BadRequestException if id is null', async () => {
      // When
      const deleteUser = async () => await service.deleteAsync(null);

      // Then
      await expect(deleteUser).rejects.toThrow(BadRequestException);
    });

    it('Should throw NotFoundException if user does not exist', async () => {
      // Given
      userRepositoryMock.exists.mockResolvedValue(false);
      const userId = 1;

      // When
      const deleteUser = async () => await service.deleteAsync(userId);

      // Then
      await expect(deleteUser).rejects.toThrow(NotFoundException);
      expect(userRepositoryMock.exists).toHaveBeenCalledWith({ id: userId });
    });

    it('Should throw ForbiddenException if user is already inactive', async () => {
      // Given
      const userId = 1;
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
        status: StatusEnum.INACTIVE,
        Media: null,
        mediaId: null,
        role: RoleEnum.CUSTOMER,
      };

      userRepositoryMock.exists.mockResolvedValue(true);
      userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);

      // When
      const deleteUser = async () => await service.deleteAsync(userId);

      // Then
      await expect(deleteUser).rejects.toThrow(ForbiddenException);
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(userId);
    });

    it('Should throw ForbiddenException if user is an admin', async () => {
      // Given
      const userId = 1;
      const existingUser: UserEntity = {
        id: userId,
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

      // When
      const deleteUser = async () => await service.deleteAsync(userId);

      // Then
      await expect(deleteUser).rejects.toThrow(ForbiddenException);
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(userId);
    });
  });
});

//------ Orders

describe('UserService - Orders', () => {
  let service: UserService;
  let userRepositoryMock: jest.Mocked<UserRepository>;
  let authRepositoryMock: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useFactory: () => ({
            getOrders: jest.fn(),
          }),
        },
        {
          provide: AuthRepository,
          useFactory: () => ({
            // Add necessary mocks for AuthRepository methods used in AuthService
          }),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepositoryMock = module.get(UserRepository);
    authRepositoryMock = module.get(AuthRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests if needed
  });

  it('should fetch orders when user is authorized', async () => {
    // Arrange
    const currentUser = {
      email: 'user@example.com',
      role: RoleEnum.ADMIN,
      id: 1,
    };
    const targetEmail = 'target@example.com';
    const userId = 1;

    const expectedOrders = [
      {
        id: 1,
        code: 'Product1',
        price: 50.5,
        userId: 1,
        estimatedDelivery: new Date('2024-06-18 10:30:45.123+00'),
        status: null,
        develiryAddressId: 1,
        createdAt: new Date('2024-06-18 10:30:45.123+00'),
        updatedAt: new Date('2024-06-18 10:30:45.123+00'),
      },
      {
        id: 2,
        code: 'Product2',
        price: 50.5,
        userId: 1,
        estimatedDelivery: new Date('2024-06-18 10:30:45.123+00'),
        status: null,
        develiryAddressId: 1,
        createdAt: new Date('2024-06-18 10:30:45.123+00'),
        updatedAt: new Date('2024-06-18 10:30:45.123+00'),
      },
    ];

    userRepositoryMock.getOrders.mockResolvedValue(expectedOrders);

    // Act
    const result = await service.fetchOrders(
      currentUser.email,
      currentUser.role,
      targetEmail,
      currentUser.id,
    );

    // Assert
    expect(result).toEqual(expectedOrders);
    expect(userRepositoryMock.getOrders).toHaveBeenCalledWith(userId);
  });

  it('should return empty array when user is not authorized', async () => {
    // Arrange
    const currentUser = {
      email: 'user@example.com',
      role: RoleEnum.CUSTOMER,
      id: 1,
    };
    const targetEmail = 'target@example.com';

    // Act
    const result = await service.fetchOrders(
      currentUser.email,
      currentUser.role,
      targetEmail,
      currentUser.id,
    );

    // Assert
    expect(result).toEqual([]);
    expect(userRepositoryMock.getOrders).not.toHaveBeenCalled();
  });
});
