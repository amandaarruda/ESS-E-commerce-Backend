import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CrudType } from 'src/utils/base/ICrudTypeMap';

import { ItensEntity } from './entity/itens.entity';
import { ItensTypeMap } from './entity/itens.type.map';

@Injectable()
export class ItensRepository {
  constructor(private readonly prisma: PrismaService) {}

  async exists(where: ItensTypeMap[CrudType.WHERE]) {
    const itensCount = await this.prisma.itens.count({
      where,
    });

    return itensCount > 0;
  }

  async create(data: ItensTypeMap[CrudType.CREATE]): Promise<ItensEntity> {
    return await this.prisma.itens.create({
      data: {
        ...data,
      },
      include: {
        Category: true,
      },
    });
  }

  async getById(id: number): Promise<ItensEntity> {
    return await this.prisma.itens.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        Category: true,
      },
    });
  }

  async update(
    id: number,
    data: ItensTypeMap[CrudType.UPDATE],
  ): Promise<ItensEntity> {
    return await this.prisma.itens.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
      include: {
        Category: true,
      },
    });
  }

  async delete(id: number): Promise<ItensEntity> {
    return await this.prisma.itens.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
