import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Logger,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedUser } from 'src/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/auth/models/UserPayload';

import { CartService } from './cart.service';

interface AddCartInterface {
  cartId: number;
  productId: number;
}

@ApiBearerAuth()
@Controller('cart')
@ApiTags('Cart')
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @Post('create')
  async createCart(@AuthenticatedUser() currentUser: UserPayload) {
    this.logger.log('Creating a new cart');
    return this.cartService.createCart({
      userId: currentUser.id,
      locked: false,
    });
  }

  @Get('get')
  async getCart(@AuthenticatedUser() currentUser: UserPayload) {
    this.logger.log('Getting cart');
    return this.cartService.getCart({ userId: currentUser.id });
  }

  @Post('add')
  async addCart(
    @Body() addCartDto: any,
    @AuthenticatedUser() currentUser: UserPayload,
  ) {
    this.logger.log('Adding to cart');
    return this.cartService.addToCart({
      productId: addCartDto.productId,
      userId: currentUser.id,
      cartId: addCartDto.cartId,
      quantity: 1,
    });
  }

  @Delete('remove')
  async removeCart(
    @Body() remCartDto: any,
    @AuthenticatedUser() currentUser: UserPayload,
  ) {
    this.logger.log('Removing from cart');
    return this.cartService.removeFromCart({
      productId: remCartDto.productId,
      userId: currentUser.id,
      cartId: remCartDto.cartId,
      quantity: 0,
    });
  }

  @Put('update')
  async attCart(
    @Body() attCartDto: any,
    @AuthenticatedUser() currentUser: UserPayload,
  ) {
    this.logger.log('Att cart');
    return this.cartService.attCart({
      productId: attCartDto.productId,
      userId: currentUser.id,
      cartId: attCartDto.cartId,
      quantity: attCartDto.quantity,
    });
  }
}
