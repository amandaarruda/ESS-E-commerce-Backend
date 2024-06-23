import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { ProductController } from 'src/modules/itens/itens.controller';
import { ProductRepository } from 'src/modules/itens/itens.repository';
import { ProductService } from 'src/modules/itens/itens.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  imports: [PrismaModule],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}
