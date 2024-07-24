import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { createOrderDTO } from './order-type';
import { OrdersService } from './orders.service';

@Controller('orders')
@ApiBearerAuth()
@ApiTags('Order')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() orderData: createOrderDTO) {
    return this.ordersService.createOrder(orderData);
  }

  @Delete('/:id')
  async cancelOrder(@Param('id') id: number) {
    return await this.ordersService.cancelOrder(id);
  }

  @Post(':orderId/products/:productId/:quantity')
  async addProductOrder(
    @Param('orderId') orderId: number,
    @Param('productId') productId: number,
    @Param('quantity') quantity: number,
  ) {
    return await this.ordersService.addProductOrder(
      orderId,
      productId,
      quantity,
    );
  }

  @Get(':orderId/products')
  async getOrderProducts(@Param('orderId') orderId: number) {
    return await this.ordersService.getOrderProducts(orderId);
  }
}
