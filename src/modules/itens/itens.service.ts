import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Itens } from '@prisma/client';
import { ItensRepository } from 'src/modules/itens/itens.repository';
import { MessagesHelperKey, getMessage } from 'src/utils/messages.helper';
import { handleError } from 'src/utils/treat.exceptions';

import { ItensCreateDto } from './dto/request/itens.create.dto';
import { ItensEntity } from './entity/itens.entity';

@Injectable()
export class ItensService {
  constructor(protected readonly itensRepository: ItensRepository) {}

  async createItem(data: ItensCreateDto): Promise<ItensEntity> {
    const createItemData = {
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      category: {
        connect: { id: data.categoryId },
      },
      Media: {
        create: {
          url: data.imageUrl,
        },
      },
    };

    try {
      return await this.itensRepository.create(createItemData);
    } catch (error) {
      console.error('Error creating item:', error);
    }
  }

  async getItemById(id: number): Promise<ItensEntity> {
    try {
      const item = await this.itensRepository.getById(id);
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
    data: Partial<ItensCreateDto>,
  ): Promise<ItensEntity> {
    try {
      const item = await this.itensRepository.getById(id);
      if (!item) {
        throw new NotFoundException(
          getMessage(MessagesHelperKey.ITEM_NOT_FOUND),
        );
      }

      await this.itensRepository.update(id, {
        name: data.name || item.name,
        description: data.description || item.description,
        price: data.price || item.price,
        imageUrl: data.imageUrl || item.imageUrl,
      });

      return await this.itensRepository.getById(id);
    } catch (error) {
      handleError(error);
    }
  }

  async deleteItem(id: number): Promise<void> {
    try {
      const item = await this.itensRepository.getById(id);
      if (!item) {
        throw new NotFoundException(
          getMessage(MessagesHelperKey.ITEM_NOT_FOUND),
        );
      }

      await this.itensRepository.delete(id);
    } catch (error) {
      handleError(error);
    }
  }
}
