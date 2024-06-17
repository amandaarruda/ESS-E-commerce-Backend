import {
    Injectable,
  } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma/prisma.service';
import { CategoryTypeMap } from './entity/category.type.map';
import { CrudType } from 'src/utils/base/ICrudTypeMap';
import { CategoryEntity } from './entity/category.entity';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async exists(where: CategoryTypeMap[CrudType.WHERE]) {
    const categoriesCount = await this.prisma.category.count({
      where,
    });

    return categoriesCount > 0;
  }

  async create(data: CategoryTypeMap[CrudType.CREATE]): Promise<CategoryEntity> {
    return await this.prisma.category.create({
      data: {
        ...data,
      },
      include: {
        Media: true,
      },
    });
  }
}