import { Injectable, BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OperationCanceledException } from 'typescript';

import { PrismaService } from '../../database/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { createOrderDTO } from './order-type';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly orderRepository: OrdersRepository,
  ) {}

  async createOrder(orderData: createOrderDTO) {
    const order = await this.orderRepository.create(orderData);

    const emailMarkup = `<h1>Eba! Seu pedido foi confirmado. Agradecemos a preferência pelo seu pedido!</h1>
                         <p>Seu pedido com código ${order.code} foi recebido e está sendo processado.</p>`;

    await this.emailService.sendEmail(
      emailMarkup,
      'Confirmação de Pedido',
      orderData.email,
    );

    return order;
  }

  async cancelOrder(id: number) {
    if (!id) {
      throw new BadRequestException('Id não enviado');
    }

    await this.orderRepository.cancelOrder(id);

    return id;
  }

  async addProductOrder(orderId: number, productId: number, quantity: number) {
    if (!orderId || !productId) {
      throw new BadRequestException('Informações não suficientes');
    }
    const existingRelationship = this.prisma.orderProduct.findMany({
      where: {
        productId: productId,
        orderId: orderId,
      },
    });

    if ((await existingRelationship).length > 0) {
      throw new BadRequestException('Relação já existente');
    }

    return this.orderRepository.addProduct(orderId, productId, quantity);
  }

  async getOrderProducts(orderId: number) {
    if (!orderId) {
      throw new BadRequestException('Informações não suficientes');
    }

    return this.orderRepository.getProducts(orderId);
  }
}
