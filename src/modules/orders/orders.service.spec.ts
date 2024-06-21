import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../database/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('deve criar um novo pedido e enviar email de confirmação', async () => {
      const orderData = {
        email: 'test@example.com',
        code: 'order123',
        price: 100.0,
        userId: 1,
        deliveryAddressId: null,
      };
      const createdOrder = {
        id: 1,
        ...orderData,
        estimatedDelivery: new Date(),
        status: 'PROCESSING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.order.create as jest.Mock).mockResolvedValue(createdOrder);
      (emailService.sendEmail as jest.Mock).mockResolvedValue(true);

      const result = await service.createOrder(orderData);

      expect(prismaService.order.create).toHaveBeenCalledWith({
        data: {
          ...orderData,
          estimatedDelivery: expect.any(Date),
          status: 'PROCESSING',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        `<h1>Eba! Seu pedido foi confirmado. Agradecemos a preferência pelo seu pedido!</h1>
         <p>Seu pedido com código order123 foi recebido e está sendo processado.</p>`,
        'Confirmação de Pedido',
        'test@example.com',
      );
      expect(result).toEqual(createdOrder);
    });

    it('deve lidar com falha no envio do email', async () => {
      const orderData = {
        email: 'test@example.com',
        code: 'order123',
        price: 100.0,
        userId: 1,
        deliveryAddressId: null,
      };
      const createdOrder = {
        id: 1,
        ...orderData,
        estimatedDelivery: new Date(),
        status: 'PROCESSING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.order.create as jest.Mock).mockResolvedValue(createdOrder);
      (emailService.sendEmail as jest.Mock).mockRejectedValue(
        new Error('Falha ao enviar o email'),
      );

      await expect(service.createOrder(orderData)).rejects.toThrow(
        'Falha ao enviar o email',
      );

      expect(prismaService.order.create).toHaveBeenCalledWith({
        data: {
          ...orderData,
          estimatedDelivery: expect.any(Date),
          status: 'PROCESSING',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        `<h1>Eba! Seu pedido foi confirmado. Agradecemos a preferência pelo seu pedido!</h1>
         <p>Seu pedido com código order123 foi recebido e está sendo processado.</p>`,
        'Confirmação de Pedido',
        'test@example.com',
      );
    });
  });
});
