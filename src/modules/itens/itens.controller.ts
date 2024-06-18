import { Controller } from '@nestjs/common';
import {
  Body,
  Post,
  Delete,
  Patch,
  Res,
  Param,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import { RoleEnum } from '@prisma/client';
import { Response } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ItensCreateDto } from 'src/modules/itens/dto/request/itens.create.dto';
import { ItensUpdateDto } from 'src/modules/itens/dto/request/itens.update.dto';
import { ApiExceptionResponse } from 'src/utils/swagger-schemas/SwaggerSchema';

import { ItensResponseDto } from './dto/response/itens.dto';
import { ItensService } from './itens.service';

@ApiBearerAuth()
@Controller('itens')
@ApiTags('Itens')
export class ItensController {
  constructor(protected readonly itensService: ItensService) {}

  @ApiOperation({ summary: 'Create item' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ItensResponseDto,
  })
  @ApiExceptionResponse()
  @Post()
  @Roles(RoleEnum.ADMIN)
  async create(@Res() response: Response, @Body() body: ItensCreateDto) {
    const item = await this.itensService.createItem(body);

    return response.status(HttpStatus.CREATED).json(item);
  }

  @ApiOperation({ summary: 'Update item by ID' })
  @ApiParam({
    name: 'itemId',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ItensResponseDto,
  })
  @ApiExceptionResponse()
  @Patch('/:itemId')
  @Roles(RoleEnum.ADMIN)
  async update(
    @Res() response: Response,
    @Param('itemId') itemId: number,
    @Body() body: ItensUpdateDto,
  ) {
    const updatedItem = await this.itensService.updateItem(itemId, body);

    return response.status(HttpStatus.OK).json(updatedItem);
  }

  @ApiOperation({ summary: 'Delete item by ID' })
  @ApiParam({
    name: 'itemId',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item successfully deleted',
  })
  @ApiExceptionResponse()
  @Delete('/:itemId')
  @Roles(RoleEnum.ADMIN)
  async delete(@Res() response: Response, @Param('itemId') itemId: number) {
    await this.itensService.deleteItem(itemId);

    return response.status(HttpStatus.OK).json({
      message: 'Item successfully deleted',
    });
  }
}
