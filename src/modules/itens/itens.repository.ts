import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CategoryEntity } from 'src/modules/categories/entity/category.entity';
import { MediaEntity } from 'src/modules/itens/entity/media.entity';
import { CrudType } from 'src/utils/base/ICrudTypeMap';

import { ProductCreateDto } from './dto/request/itens.create.dto';
import { ProductEntity } from './entity/itens.entity';
import { ProductTypeMap } from './entity/itens.type.map';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ProductCreateDto): Promise<ProductEntity> {
    const productData = {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock || 0,
      categoryId: data.categoryId,
      productMedia: {
        create: [
          {
            media: {
              create: { url: data.imageUrl },
            },
          },
        ],
      },
      category: {
        connect: { id: data.categoryId },
      },
    };

    return await this.prisma.product.create({
      data: productData,
      include: {
        category: true,
        productMedia: true,
      },
    });
  }

  async getById(id: number): Promise<ProductEntity> {
    return await this.prisma.product.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        category: true,
        productMedia: true,
      },
    });
  }

  async update(
    id: number,
    data: Partial<ProductCreateDto>,
  ): Promise<ProductEntity> {
    return await this.prisma.product.update({
      where: {
        id,
      },
      data,
      include: {
        category: true,
        productMedia: true,
      },
    });
  }

  async delete(id: number): Promise<ProductEntity> {
    return await this.prisma.product.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      include: {
        category: true,
        productMedia: true,
      },
    });
  }
}
