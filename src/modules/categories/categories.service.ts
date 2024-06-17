import {
    Injectable,
    ConflictException,
} from '@nestjs/common';

import { CategoriesRepository } from './categories.repository';
import { CategoryEntity } from './entity/category.entity';
import { CategoryTypeMap } from './entity/category.type.map';
import { CrudType } from 'src/utils/base/ICrudTypeMap';
import { MessagesHelperKey, getMessage } from 'src/utils/messages.helper';
import { handleError } from 'src/utils/treat.exceptions';

@Injectable()
export class CategoriesService {
    constructor(
        protected readonly categoriesRepository: CategoriesRepository,
    ) {}

    async addCategory(data: CategoryTypeMap[CrudType.CREATE]): Promise<CategoryEntity> {
        try {
            if ((await this.categoriesRepository.exists({ name: data.name.trim() })) === true) {
              throw new ConflictException(
                getMessage(MessagesHelperKey.CATEGORY_ALREADY_EXISTS),
              );
            }
      
            return await this.categoriesRepository.add(data);
          } catch (error) {
            handleError(error);
          }
    }
}