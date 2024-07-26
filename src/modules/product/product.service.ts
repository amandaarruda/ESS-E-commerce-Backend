import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { Paginated } from 'src/utils/base/IPaginated';
import { MessagesHelperKey, getMessage } from 'src/utils/messages.helper';
import { handleError } from 'src/utils/treat.exceptions';

import { ProductCreateDto } from './dto/request/product.create.dto';
import { ProductUpdateDto } from './dto/request/product.update.dto';
import { ProductPaginationResponse } from './dto/response/product.pagination.response';
import { TProductPagination } from './dto/type/product.pagination';
import { ProductEntity } from './entity/product.entity';
import { ProductTypeMap } from './entity/product.type.map';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  private logger = new Logger(ProductService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  /*async createItem(data: ProductCreateDto): Promise<ProductEntity> {
    try {
      if (data.price <= 0)
        throw new BadRequestException(
          getMessage(MessagesHelperKey.PRICE_LESS_THAN_ZERO),
        );
      if (data.stock < 0)
        throw new BadRequestException(
          getMessage(MessagesHelperKey.STOCK_LESS_THAN_ZERO),
        );
      const productData: Prisma.ProductCreateInput = {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock || 0,
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
      const createdItem = await this.productRepository.create(productData);
      return createdItem;
    } catch (error) {
      handleError(error);
    }
  }*/

  async createItem(data: ProductCreateDto): Promise<ProductEntity> {
    try {
      const exists = await this.productRepository.exists({
        name: data.name,
        deletedAt: null,
      });
      if (exists) {
        throw new BadRequestException('Item already exists');
      }
      if (data.price <= 0) {
        throw new BadRequestException(
          getMessage(MessagesHelperKey.PRICE_LESS_THAN_ZERO),
        );
      }
      if (data.stock < 0) {
        throw new BadRequestException(
          getMessage(MessagesHelperKey.STOCK_LESS_THAN_ZERO),
        );
      }

      const productData: Prisma.ProductCreateInput = {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
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

      const createdItem = await this.productRepository.create(productData);
      return createdItem;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async getItemById(id: number): Promise<ProductEntity> {
    try {
      const item = await this.productRepository.getById(id);
      if (!item) {
        throw new NotFoundException(
          getMessage(MessagesHelperKey.ITEM_NOT_FOUND),
        );
      }
      return item;
    } catch (error) {
      handleError(error);
    }
  }

  /*async updateItem(id: number, data: ProductUpdateDto): Promise<ProductEntity> {
    try {
      const dataPrisma: Prisma.ProductUpdateInput = {};
      if (data.name) dataPrisma.name = data.name;
      if (data.description) dataPrisma.description = data.description;
      if (data.price) {
        if (data.price <= 0)
          throw new BadRequestException(
            getMessage(MessagesHelperKey.PRICE_LESS_THAN_ZERO),
          );
        dataPrisma.price = data.price;
      }
      if (data.stock) {
        if (data.stock < 0)
          throw new BadRequestException(
            getMessage(MessagesHelperKey.STOCK_LESS_THAN_ZERO),
          );
        dataPrisma.stock = data.stock;
      }
      if (data.categoryId) {
        dataPrisma.category = {
          connect: { id: data.categoryId },
        };
      }
      if (data.imageUrl) {
        dataPrisma.productMedia = {
          create: [
            {
              media: {
                create: { url: data.imageUrl },
              },
            },
          ],
        };
      }

      const updatedItem = await this.productRepository.update(id, dataPrisma);
      return updatedItem;
    } catch (error) {
      handleError(error);
    }
  }*/

  async updateItem(id: number, data: ProductUpdateDto): Promise<ProductEntity> {
    try {
      const existingProduct = await this.productRepository.getById(id);
      if (!existingProduct) {
        throw new NotFoundException(
          getMessage(MessagesHelperKey.ITEM_NOT_FOUND),
        );
      }

      const dataPrisma: Prisma.ProductUpdateInput = {};
      if (data.name) dataPrisma.name = data.name;
      if (data.description) dataPrisma.description = data.description;
      if (data.price) {
        if (data.price <= 0)
          throw new BadRequestException(
            getMessage(MessagesHelperKey.PRICE_LESS_THAN_ZERO),
          );
        dataPrisma.price = data.price;
      }
      if (data.stock != null) {
        if (data.stock < 0)
          throw new BadRequestException(
            getMessage(MessagesHelperKey.STOCK_LESS_THAN_ZERO),
          );
        dataPrisma.stock = data.stock;
      }
      if (data.categoryId) {
        dataPrisma.category = {
          connect: { id: data.categoryId },
        };
      }
      if (data.imageUrl) {
        dataPrisma.productMedia = {
          create: [
            {
              media: {
                create: { url: data.imageUrl },
              },
            },
          ],
        };
      }

      const updatedItem = await this.productRepository.update(id, dataPrisma);
      return updatedItem;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async findFilteredAsync(
    filter: DefaultFilter<ProductTypeMap>,
  ): Promise<Paginated<Partial<ProductPaginationResponse>>> {
    try {
      this.logger.log(`Find filtered async`);

      const productFiltered =
        await this.productRepository.findFilteredAsync(filter);

      const productFilteredDataMapped = this.mapper.mapArray(
        productFiltered.data,
        TProductPagination,
        ProductPaginationResponse,
      );

      return {
        ...productFiltered,
        data: productFilteredDataMapped,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async getProducts(): Promise<ProductEntity[]> {
    try {
      const products = await this.productRepository.getAll();
      return products;
    } catch (error) {
      handleError(error);
    }
  }
  /*async deleteItem(id: number): Promise<void> {
    try {
      await this.productRepository.delete(id);
    } catch (error) {
      handleError(error);
    }
  }
  async deleteItem(id: number): Promise<boolean> {
    try {
      const product = await this.productRepository.getById(id);

      if (!product) {
        throw new Error('ITEM_NOT_FOUND');
      }

      const deletedItem = await this.productRepository.delete(id);

      return !!deletedItem;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
  async deleteItem(id: number): Promise<boolean> {
    try {
      const product = await this.productRepository.getById(id);

      if (!product) {
        throw new Error('ITEM_NOT_FOUND');
      }

      const deletedItem = await this.productRepository.delete(id);

      return !!deletedItem;
    } catch (error) {
      // Remova a chamada para handleError para permitir a propagação do erro original
      throw error;
    }
  }*/
  async deleteItem(id: number): Promise<boolean> {
    if (id === undefined || id === null) {
      throw new Error('Validation error: ID do item não fornecido');
    }

    try {
      const product = await this.productRepository.getById(id);

      if (!product) {
        throw new Error('ITEM_NOT_FOUND');
      }

      const deletedItem = await this.productRepository.delete(id);

      return !!deletedItem;
    } catch (error) {
      throw error;
    }
  }
}
