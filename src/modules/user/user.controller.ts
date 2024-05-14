import { Controller } from '@nestjs/common';
import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleEnum } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { AuthenticatedUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRegisteredResponse } from 'src/auth/dto/response/UserToken';
import { UserPayload } from 'src/auth/models/UserPayload';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import {
  ApiExceptionResponse,
  ApiOkResponsePaginated,
} from 'src/utils/swagger-schemas/SwaggerSchema';

import { UpdateUserPersonalData } from './dto/request/update.personal.data.dto';
import { UpdateUserPassword } from './dto/request/update.personal.password.dto';
import { UserCreateDto } from './dto/request/user.create.dto';
import { UserUpdateDto } from './dto/request/user.update.dto';
import { UserPaginationResponse } from './dto/response/user.pagination.response';
import { UserEntity } from './entity/user.entity';
import { UserTypeMap } from './entity/user.type.map';
import { UserService } from './user.service';

@ApiBearerAuth()
@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(
    protected readonly service: UserService,
    protected readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Get filtered user' })
  @ApiOkResponsePaginated(UserPaginationResponse)
  @ApiExceptionResponse()
  @Get()
  @Roles(RoleEnum.ADMIN)
  async getFilteredAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Query() filter: DefaultFilter<UserTypeMap>,
  ) {
    const filteredData = await this.service.findFilteredAsync(
      filter,
      currentUser,
    );

    return response.status(HttpStatus.OK).json(filteredData);
  }

  @ApiOperation({ summary: 'Get one user' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserEntity,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiExceptionResponse()
  @Get('/:id')
  @Roles(RoleEnum.ADMIN)
  protected async findByIdAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: number,
  ) {
    const userById = await this.service.findByIdAsync(id);

    return response.status(HttpStatus.OK).json(userById);
  }

  @ApiOperation({ summary: 'Create admin user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: UserRegisteredResponse,
  })
  @ApiBody({ type: UserCreateDto })
  @ApiExceptionResponse()
  @Post()
  @Roles(RoleEnum.ADMIN)
  protected async createAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Body() dto: UserCreateDto,
  ) {
    const data = await this.authService.register(dto, currentUser);

    return response.status(HttpStatus.CREATED).json(data.id);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBody({ type: UserUpdateDto })
  @ApiExceptionResponse()
  @Put('/:id')
  @Roles(RoleEnum.ADMIN)
  protected async updateAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: number,
    @Body() dto: UserUpdateDto,
  ) {
    await this.service.updateAsync(id, dto, currentUser);

    return response.status(HttpStatus.OK).json(id);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiQuery({
    name: 'version',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @Delete('/:id')
  @Roles(RoleEnum.ADMIN)
  protected async deleteAsync(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
    @Param('id') id: number,
    @Query('version') version: number,
  ) {
    await this.service.deleteAsync(id, version, currentUser);

    return response.status(HttpStatus.OK).json(id);
  }

  @ApiOperation({ summary: 'Change personal password' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @Patch('personal/password')
  protected async changePersonalPassword(
    @AuthenticatedUser() currentUser: UserPayload,
    @Body() body: UpdateUserPassword,
    @Res() response: Response,
  ) {
    await this.service.updateUserPassword(body, currentUser);

    return response.status(HttpStatus.OK).send();
  }

  @ApiOperation({ summary: 'Change personal data' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @Patch('personal/data')
  protected async changePersonalData(
    @AuthenticatedUser() currentUser: UserPayload,
    @Body() body: UpdateUserPersonalData,
    @Res() response: Response,
  ) {
    await this.service.updateUserPersonalData(body, currentUser);

    return response.status(HttpStatus.OK).send();
  }

  @ApiOperation({ summary: 'Inactive my account' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @Delete('personal')
  protected async inactiveMyAccount(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
  ) {
    await this.service.deleteAsync(
      currentUser.id,
      currentUser.version,
      currentUser,
    );

    return response.status(HttpStatus.OK).send();
  }
}
