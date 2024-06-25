import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { defineFeature, loadFeature } from 'jest-cucumber';

import { PrismaService } from '../../../database/prisma/prisma.service';
import { EmailService } from '../../email/email.service';
import { OrdersService } from '../orders.service';

const feature = loadFeature('features/orderConfirmation.feature');

let ordersService: OrdersService;
let prismaService: PrismaService;
let emailService: EmailService;
let orderData: any;
let error: Error | null = null;

defineFeature(feature, test => {
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        PrismaService,
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
  });

  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  async function clearDatabase() {
    await prismaService.user.deleteMany();
  }

  test('Envio de email de confirmação após criação de um pedido', ({
    given,
    when,
    then,
  }) => {
    given(
      'que um novo pedido é criado com o email "test@example.com"',
      async () => {
        const user = await prismaService.user.create({
          data: {
            email: 'test@example.com',
            name: 'Test User',
            password: 'password',
            role: 'CUSTOMER',
          },
        });

        orderData = {
          email: 'test@example.com',
          code: 'order123',
          price: 100.0,
          userId: user.id,
          deliveryAddressId: null,
          estimatedDelivery: new Date(),
        };
      },
    );

    when('o pedido é processado', async () => {
      try {
        await ordersService.createOrder(orderData);
      } catch (err) {
        error = err;
      }
    });

    then(
      'um email deve ser enviado para "test@example.com" com o assunto "Confirmação de Pedido"',
      async () => {
        expect(emailService.sendEmail).toHaveBeenCalledWith(
          expect.stringContaining('<h1>Eba! Seu pedido foi confirmado.'),
          'Confirmação de Pedido',
          'test@example.com',
        );
      },
    );
  });

  test('Falha no envio de email após criação de um pedido', ({
    given,
    when,
    then,
  }) => {
    given(
      'que um novo pedido é criado com o email "test@example.com"',
      async () => {
        const user = await prismaService.user.create({
          data: {
            email: 'test@example.com',
            name: 'Test User',
            password: 'password',
            role: 'CUSTOMER',
          },
        });

        orderData = {
          email: 'test@example.com',
          code: 'order123',
          price: 100.0,
          userId: user.id,
          deliveryAddressId: null,
          estimatedDelivery: new Date(),
        };
      },
    );

    given('o envio de email falha', () => {
      jest
        .spyOn(emailService, 'sendEmail')
        .mockRejectedValue(new Error('Falha ao enviar o email'));
    });

    when('o pedido é processado', async () => {
      try {
        await ordersService.createOrder(orderData);
      } catch (err) {
        error = err;
      }
    });

    then(
      'uma exceção deve ser lançada com a mensagem "Falha ao enviar o email"',
      () => {
        expect(error).toBeDefined();
        expect(error.message).toBe('Falha ao enviar o email');
      },
    );
  });
});
