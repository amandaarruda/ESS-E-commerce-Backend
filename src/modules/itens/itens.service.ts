import { Injectable, NotFoundException } from '@nestjs/common';
import { MessagesHelperKey, getMessage } from 'src/utils/messages.helper';
import { handleError } from 'src/utils/treat.exceptions';

import { ProductCreateDto } from './dto/request/itens.create.dto';
import { ProductEntity } from './entity/itens.entity';
import { ProductRepository } from './itens.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async createItem(data: ProductCreateDto): Promise<ProductEntity> {
    try {
      const createdItem = await this.productRepository.create(data);
      return createdItem;
    } catch (error) {
      console.error('Error creating item:', error);
      throw new Error('Failed to create item');
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

  async updateItem(
    id: number,
    data: Partial<ProductCreateDto>,
  ): Promise<ProductEntity> {
    try {
      const updatedItem = await this.productRepository.update(id, data);
      if (!updatedItem) {
        throw new NotFoundException(
          getMessage(MessagesHelperKey.ITEM_NOT_FOUND),
        );
      }
      return updatedItem;
    } catch (error) {
      handleError(error);
    }
  }

  async deleteItem(id: number): Promise<void> {
    try {
      await this.productRepository.delete(id);
    } catch (error) {
      handleError(error);
    }
  }
}
