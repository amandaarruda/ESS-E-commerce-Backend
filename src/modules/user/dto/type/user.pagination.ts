import { AutoMap } from '@automapper/classes';
import { StatusEnum } from '@prisma/client';

export class TUserPagination {
  @AutoMap()
  id: string;

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
  role: string;

  @AutoMap()
  blocked: boolean;
}
