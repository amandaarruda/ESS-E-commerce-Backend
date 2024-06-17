import {
    Injectable,
    ConflictException,
} from '@nestjs/common';

import { CategoriesRepository } from './categories.repository';
import { CategoryEntity } from './entity/category.entity';
import { MessagesHelperKey, getMessage } from 'src/utils/messages.helper';
import { handleError } from 'src/utils/treat.exceptions';
import { CategoryCreateDto } from './dto/request/category.create.dto';

@Injectable()
export class CategoriesService {
    constructor(
        protected readonly categoriesRepository: CategoriesRepository,
    ) {}

    async createCategory(data: CategoryCreateDto): Promise<CategoryEntity> {
        let createCategoryData = {
          name: data.name,
          ...(data.imageUrl && {
            Media: {
              create: {
                url: data.imageUrl,
              },
            },
          }),
        }
        try {
            if ((await this.categoriesRepository.exists({ name: createCategoryData.name.trim() })) === true) {
              throw new ConflictException(
                getMessage(MessagesHelperKey.CATEGORY_ALREADY_EXISTS),
              );
            }
            
            return await this.categoriesRepository.create(createCategoryData);
          } catch (error) {
            handleError(error);
          }
    }
}