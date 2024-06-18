import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { ItensService } from './itens.service';

@Module({
  providers: [ItensService],
})
export class ItensModule {}
