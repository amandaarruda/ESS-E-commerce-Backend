import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

import { createOrderDTO } from './order-type';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: createOrderDTO) {
    return await this.prisma.order.create({
      data: {
        userId: data.userId,
        code: data.code,
        price: data.price,
        estimatedDelivery: data.estimatedDelivery,
        status: OrderStatus.PROCESSING,
      },
    });
  }

  async cancelOrder(id: number) {
    return await this.prisma.order.update({
      where: {
        id,
      },
      data: {
        status: OrderStatus.CANCELED,
      },
    });
  }
}
