import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, RoleEnum, StatusEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { isNumber } from 'class-validator';
import { UserPayload } from 'src/auth/models/UserPayload';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { CrudType } from 'src/utils/base/ICrudTypeMap';
import { Paginated } from 'src/utils/base/IPaginated';
import { isDevelopmentEnviroment } from 'src/utils/environment';
import { guardUser } from 'src/utils/guards/guard-user';
import { hashData } from 'src/utils/hash';
import {
  MessagesHelperKey,
  getMessage,
  setMessage,
} from 'src/utils/messages.helper';
import { handleError } from 'src/utils/treat.exceptions';

import { UpdateUserPersonalData } from './dto/request/update.personal.data.dto';
import { UpdateUserPassword } from './dto/request/update.personal.password.dto';
import { UserUpdateDto } from './dto/request/user.update.dto';
import { UserPaginationResponse } from './dto/response/user.pagination.response';
import { TUserPagination } from './dto/type/user.pagination';
import { UserEntity } from './entity/user.entity';
import { UserTypeMap } from './entity/user.type.map';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    protected readonly userRepository: UserRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createAsync(
    data: UserTypeMap[CrudType.CREATE],
    currentUser: UserPayload,
  ): Promise<UserEntity> {
    this.logger.log(`Create user`);

    try {
      if ((await this.exists({ email: data.email.trim() })) === true) {
        this.logger.debug(`Email already exists`);
        throw new ConflictException(
          getMessage(MessagesHelperKey.EMAIL_ALREADY_EXISTS),
        );
      }

      return await this.userRepository.createAsync(data);
    } catch (error) {
      this.logger.debug(`Error on create user ${error}`);
      handleError(error);
    }
  }

  async updateAsync(
    id: number,
    data: UserUpdateDto,
    currentUser: UserPayload,
  ): Promise<Partial<UserEntity>> {
    this.logger.log(`Update user`);

    try {
      if (currentUser.id === id) {
        this.logger.warn(
          `User is trying to update itself, returning without changes`,
        );

        throw new ForbiddenException(
          getMessage(MessagesHelperKey.USER_UPDATE_YOURSELF),
        );
      }

      if (id == null) {
        this.logger.debug(`Id is required`);
        throw new BadRequestException(
          getMessage(MessagesHelperKey.ID_REQUIRED),
        );
      }

      const userExists = await this.exists({ id });

      if (!userExists) {
        this.logger.debug(`User not found`);
        throw new NotFoundException(
          setMessage(getMessage(MessagesHelperKey.USER_NOT_FOUND), id),
        );
      }

      const userBeingEdited = await this.userRepository.findByIdAsync(id);

      if (!userBeingEdited) {
        this.logger.debug('User being edited is inactive');
        throw new ForbiddenException(
          setMessage(getMessage(MessagesHelperKey.USER_INACTIVE), id),
        );
      }

      const userUpdateInput: Prisma.UserUpdateInput = {
        version: data.version,
        Role: {
          connect: {
            name: userBeingEdited.Role.name,
          },
        },
      };

      if (data.name) userUpdateInput.name = data.name;

      if (data.telephone) userUpdateInput.telephone = data.telephone;

      if (data.email) {
        if (
          (await this.exists({ email: data.email, id: { not: id } })) === true
        ) {
          this.logger.debug(`Email already exists`);
          throw new ConflictException(
            getMessage(MessagesHelperKey.EMAIL_ALREADY_EXISTS),
          );
        }

        userUpdateInput.email = data.email;
      }

      if (data.image) {
        this.logger.debug(`Updating mediaUrl`);

        userUpdateInput.Media = {
          upsert: {
            where: {
              id: userBeingEdited?.mediaId || undefined,
            },
            create: {
              url: data.image,
            },
            update: {
              url: data.image,
            },
          },
        };
      }

      const userUpdated = await this.userRepository.updateAsync(
        id,
        userUpdateInput,
      );

      this.logger.debug(`User history created for logs`);

      return userUpdated;
    } catch (error) {
      this.logger.debug(`Error on update user ${error}`);
      handleError(error);
    }
  }

  async deleteAsync(
    id: number,
    version: number,
    currentUser: UserPayload,
  ): Promise<void> {
    this.logger.log(`Delete user`);

    if (id == null) {
      this.logger.debug(`Id is required`);
      throw new BadRequestException(getMessage(MessagesHelperKey.ID_REQUIRED));
    }

    if (version == null || isNumber(version) === false) {
      this.logger.debug(`Version is required`);
      throw new BadRequestException(
        getMessage(MessagesHelperKey.VERSION_REQUIRED),
      );
    }

    if (currentUser.id === id) {
      this.logger.warn(
        `User is trying to delete itself, returning without changes`,
      );

      throw new ForbiddenException(
        getMessage(MessagesHelperKey.USER_DELETE_YOURSELF),
      );
    }

    try {
      if ((await this.exists({ id })) === false) {
        this.logger.debug(`User not found`);
        throw new NotFoundException(
          setMessage(getMessage(MessagesHelperKey.USER_NOT_FOUND), id),
        );
      }

      const userExists = await this.exists({ id });

      if (!userExists) {
        this.logger.debug(`User not found`);
        throw new NotFoundException(
          setMessage(getMessage(MessagesHelperKey.USER_NOT_FOUND), id),
        );
      }

      const userToBeDeleted = await this.userRepository.findByIdAsync(id);

      if (
        !userToBeDeleted ||
        userToBeDeleted.deletedAt != null ||
        userToBeDeleted.status === StatusEnum.INACTIVE
      ) {
        throw new ForbiddenException(
          setMessage(getMessage(MessagesHelperKey.USER_INACTIVE), id),
        );
      }

      await this.userRepository.deleteAsync(id, version);
    } catch (error) {
      this.logger.debug(`Error on delete ${error}`);

      handleError(error);
    }
  }

  async findByIdAsync(id: number): Promise<UserEntity> {
    try {
      this.logger.log(`Find by id`);

      if (id == null) {
        this.logger.debug(`Id is required`);
        throw new BadRequestException(
          getMessage(MessagesHelperKey.ID_REQUIRED),
        );
      }

      if ((await this.exists({ id })) === false) {
        this.logger.debug(`User not found`);
        throw new NotFoundException(
          setMessage(getMessage(MessagesHelperKey.USER_NOT_FOUND), id),
        );
      }

      const user = await this.userRepository.findByIdAsync(id);

      if (
        !user ||
        user.deletedAt != null ||
        user.status == StatusEnum.INACTIVE
      ) {
        throw new ForbiddenException(
          setMessage(getMessage(MessagesHelperKey.USER_INACTIVE), id),
        );
      }

      return user;
    } catch (error) {
      handleError(error);
    }
  }

  async exists(where: UserTypeMap[CrudType.WHERE]): Promise<boolean> {
    try {
      this.logger.log(`exists`);

      return await this.userRepository.exists(where);
    } catch (error) {
      handleError(error);
    }
  }

  async findBy<S, T>(
    where: UserTypeMap[CrudType.WHERE],
    select: UserTypeMap[CrudType.SELECT],
    optionals?: {
      orderBy?: UserTypeMap[CrudType.ORDER_BY];
    },
  ): Promise<Partial<UserEntity> | T> {
    try {
      this.logger.log(`Find by`);

      if ((await this.exists(where)) === false) {
        this.logger.debug(`User not found`);
        throw new NotFoundException(
          setMessage(getMessage(MessagesHelperKey.USER_NOT_FOUND), ''),
        );
      }

      const data = await this.userRepository.findBy(
        where,
        select,
        optionals?.orderBy,
      );

      return data;
    } catch (error) {
      handleError(error);
    }
  }

  async findAllBy(
    where: UserTypeMap[CrudType.WHERE],
    select: UserTypeMap[CrudType.SELECT],
    optionals?: {
      orderBy?: UserTypeMap[CrudType.ORDER_BY];
    },
  ): Promise<Partial<UserEntity>[]> {
    try {
      this.logger.log(`Find all by`);

      if ((await this.exists(where)) === false) {
        this.logger.debug(`User not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.USERS_NOT_FOUND),
        );
      }

      const data = await this.userRepository.findAllBy(
        where,
        select,
        optionals?.orderBy,
      );

      return data;
    } catch (error) {
      handleError(error);
    }
  }

  async findFilteredAsync(
    filter: DefaultFilter<UserTypeMap>,
    currentUser: UserPayload,
  ): Promise<Paginated<Partial<UserPaginationResponse>>> {
    try {
      this.logger.log(`Find filtered async`);

      const userFiltered = await this.userRepository.findFilteredAsync(
        filter,
        currentUser,
      );

      const userFilteredDataMapped = this.mapper.mapArray(
        userFiltered.data,
        TUserPagination,
        UserPaginationResponse,
      );

      return {
        ...userFiltered,
        data: userFilteredDataMapped,
      };
    } catch (error) {
      handleError(error);
    }
  }
  getFilterQueryFromSelectedModule(arg0: string, search: string) {
    throw new Error('Method not implemented.');
  }
  getSelectQueryFromSelectedModule(arg0: string) {
    throw new Error('Method not implemented.');
  }

  async findByEmail(email: string) {
    try {
      this.logger.log(`Find by email`);

      const user = await this.userRepository.findByEmail(email);

      return user;
    } catch (error) {
      handleError(error);
    }
  }

  async updateUserPassword(
    body: UpdateUserPassword,
    currentUser: UserPayload,
  ): Promise<void> {
    this.logger.debug(`Update user password`);

    if (body.actualPassword === body.newPassword) {
      throw new BadRequestException(
        getMessage(MessagesHelperKey.PASSWORD_ARE_EQUALS),
      );
    }

    const user = await this.userRepository.findByIdAsync(currentUser.id);

    try {
      guardUser(
        {
          deletedAt: user?.deletedAt,
          email: user?.email,
          status: user?.status,
        },
        this.logger,
      );

      const isPasswordValid = await bcrypt.compare(
        body.actualPassword,
        user.password,
      );

      if (!isPasswordValid) {
        this.logger.debug(`Password validation is invalid`);

        throw new BadRequestException(
          getMessage(MessagesHelperKey.PASSWORD_UNMATCH),
        );
      }

      if (isDevelopmentEnviroment()) {
        this.logger.debug(`[DEV] User password : ${body.newPassword}`);
      }

      const hash = await hashData(body.newPassword);
      this.logger.debug(`Password hashed`);

      await this.userRepository.validateVersion(currentUser.id, body.version);
      await this.userRepository.updateUserPassword(currentUser.id, hash);

      this.logger.debug(`User password updated`);
    } catch (error) {
      handleError(error);
    }
  }

  async updateUserPersonalData(
    body: UpdateUserPersonalData,
    currentUser: UserPayload,
  ) {
    this.logger.debug(`Update user personal data`);

    if (!body?.name && !body?.image) {
      this.logger.debug(`No data to update, returning without changes`);

      return;
    }

    const user = await this.userRepository.findByIdAsync(currentUser?.id);

    guardUser(
      {
        deletedAt: user?.deletedAt,
        email: user?.email,
        status: user?.status,
      },
      this.logger,
    );

    try {
      guardUser(
        {
          deletedAt: user?.deletedAt,
          email: user?.email,
          status: user?.status,
        },
        this.logger,
      );

      const userUpdateInput: Prisma.UserUpdateInput = {
        version: body.version,
      };

      if (body.name) userUpdateInput.name = body.name;

      if (body.telephone) userUpdateInput.telephone = body.telephone;

      if (body.image) {
        this.logger.debug(`Has image`);

        userUpdateInput.Media = {
          upsert: {
            where: {
              id: user.mediaId || undefined,
            },
            create: {
              url: body.image,
            },
            update: {
              url: body.image,
            },
          },
        };
      }

      await this.userRepository.updateAsync(user.id, userUpdateInput);

      this.logger.debug(`User personal data updated`);
    } catch (error) {
      handleError(error);
    }
  }
}
