import { Controller } from '@nestjs/common';
import {
  Body,
  Post,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RoleEnum } from '@prisma/client';
import { Response } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  ApiExceptionResponse,
  ApiOkResponsePaginated,
} from 'src/utils/swagger-schemas/SwaggerSchema';

import { CategoryCreateDto } from './dto/request/category.create.dto';
import { CategoryResponseDto } from './dto/response/category.dto';
import { CategoriesService } from './categories.service';

@ApiBearerAuth()
@Controller('categories')
@ApiTags('Categories')
export class CategoriesController {
  constructor(
    protected readonly service: CategoriesService,
  ) {}

  @ApiOperation({ summary: 'Create category' })
  @ApiOkResponsePaginated(CategoryResponseDto)
  @ApiExceptionResponse()
  @Post()
  @Roles(RoleEnum.ADMIN)
  async create(
    @Res() response: Response,
    @Body() body: CategoryCreateDto
  ) {
    const category = await this.service.createCategory(body);

    return response.status(HttpStatus.CREATED).json(category);
  }
}
