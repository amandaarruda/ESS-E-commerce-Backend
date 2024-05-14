import { AutoMap } from '@automapper/classes';
import { RoleEnum, StatusEnum } from '@prisma/client';

export class TUserPagination {
  @AutoMap()
  id: string;

  @AutoMap()
  version: number;

  @AutoMap()
  createdAt: Date | any;

  @AutoMap()
  updatedAt: Date;

  @AutoMap()
  deletedAt: Date;

  @AutoMap()
  status: StatusEnum;

  @AutoMap()
  email: string;

  @AutoMap()
  name: string;

  @AutoMap()
  ip: string;

  @AutoMap()
  Roles: {
    Role: {
      name: RoleEnum;
    };
  }[];

  @AutoMap()
  blocked: boolean;
}
