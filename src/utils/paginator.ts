import { BadRequestException } from '@nestjs/common';
import { PaginatedResult, createPaginator } from 'prisma-pagination';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { MessagesHelperKey, getMessage } from 'src/utils/messages.helper';

import { CrudTypeMap } from './base/ICrudTypeMap';

export class Paginator {
  static async applyPagination<P, T, C extends CrudTypeMap>(
    prismaEntity: P,
    filter: DefaultFilter<C>,
  ): Promise<PaginatedResult<T>> {
    const paginate = createPaginator({
      perPage: filter.perPage,
    });

    try {
      return await paginate<T, any>(
        prismaEntity,
        {
          where: filter.where,
          ...(filter.select && { select: filter.select }),
          orderBy: filter.orderBy,
        },
        {
          page: filter.page,
        },
      );
    } catch (error) {
      throw new BadRequestException(
        getMessage(MessagesHelperKey.DATA_PAGINATION_ERROR),
      );
    }
  }
}
