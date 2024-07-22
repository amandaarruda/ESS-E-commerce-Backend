import { Controller, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { createOrderDTO } from './order-type';
import { OrdersService } from './orders.service';

@Controller('orders')
@ApiBearerAuth()
@ApiTags('User')
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
}
