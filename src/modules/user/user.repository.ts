import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, RoleEnum, StatusEnum } from '@prisma/client';
import { User } from '@prisma/client';
import { UserPayload } from 'src/auth/models/UserPayload';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { CrudType } from 'src/utils/base/ICrudTypeMap';
import { Paginated } from 'src/utils/base/IPaginated';
import { Paginator } from 'src/utils/paginator';

import { TUserPagination } from './dto/type/user.pagination';
import { UserEntity } from './entity/user.entity';
import { UserTypeMap } from './entity/user.type.map';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFilteredAsync(
    filter: DefaultFilter<UserTypeMap>,
    user?: UserPayload,
  ): Promise<Paginated<TUserPagination>> {
    const AND: Record<string, any>[] = [
      {
        status: {
          not: StatusEnum.INACTIVE,
        },
        deletedAt: null,
      },
    ];

    if (filter.search) {
      filter.search = filter.search.trim();

      if (RoleEnum[filter?.search?.toUpperCase()] != null) {
        AND.push({
          Role: {
            name: {
              equals: filter.search,
              mode: 'insensitive',
            },
          },
        });
      } else {
        AND.push({
          OR: [
            {
              name: {
                contains: filter.search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: filter.search,
                mode: 'insensitive',
              },
            },
          ],
        });
      }
    }

    const prismaSelect: UserTypeMap[CrudType.SELECT] = {
      id: true,
      version: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      email: true,
      name: true,
      Role: {
        select: {
          name: true,
        },
      },
    };

    return await Paginator.applyPagination(this.prisma.user, {
      ...filter,
      where: { AND: filter.query },
      select: prismaSelect,
    });
  }

  async updateAsync(
    id: number,
    data: UserTypeMap[CrudType.UPDATE],
  ): Promise<User> {
    await this.validateVersion(id, Number(data?.version));

    return await this.prisma.user.update({
      where: {
        id,
        version: Number(data.version),
      },
      data: {
        ...data,
        version: {
          increment: 1,
        },
      },
    });
  }

  async findBy(
    where: UserTypeMap[CrudType.WHERE],
    select: UserTypeMap[CrudType.SELECT],
    orderBy?: UserTypeMap[CrudType.ORDER_BY],
  ) {
    return await this.prisma.user.findFirst({
      where,
      select,
      orderBy,
    });
  }

  async findByIdAsync(id: number): Promise<UserEntity> {
    return await this.prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
        status: {
          not: StatusEnum.INACTIVE,
        },
      },
      include: {
        Role: true,
        Media: true,
      },
    });
  }

  async deleteAsync(id: number, version: number): Promise<void> {
    await this.validateVersion(id, Number(version));

    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        status: StatusEnum.INACTIVE,
        deletedAt: new Date(),
        version: {
          increment: 1,
        },
      },
    });
  }

  async createAsync(data: UserTypeMap[CrudType.CREATE]): Promise<UserEntity> {
    return await this.prisma.user.create({
      data: {
        ...data,
        status: StatusEnum.ACTIVE,
        version: 1,
      },
      include: {
        Role: true,
        Media: true,
      },
    });
  }

  async findAllBy(
    where: UserTypeMap[CrudType.WHERE],
    select: UserTypeMap[CrudType.SELECT],
    orderBy?: UserTypeMap[CrudType.ORDER_BY],
  ) {
    return await this.prisma.user.findMany({
      where,
      select,
      orderBy,
    });
  }

  async exists(where: UserTypeMap[CrudType.WHERE]) {
    const user = await this.prisma.user.count({
      where,
    });

    return user > 0;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email?.trim()?.toLowerCase() },
      include: {
        Role: true,
        Media: true,
      },
    });

    return user;
  }

  async updateUserPassword(id: number, password: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
        recoveryPasswordToken: null,
        version: {
          increment: 1,
        },
      },
    });
  }

  async validateVersion(id: number, version: number) {
    if (version === undefined) {
      throw new BadRequestException('Version is required');
    }

    const existentUserWithVersion = await this.exists({
      id,
      version: Number(version),
    });

    if (!existentUserWithVersion) {
      throw new ConflictException('Não existe uma entidade com essa versão');
    }
  }
}
