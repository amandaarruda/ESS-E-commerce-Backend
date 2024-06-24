import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
