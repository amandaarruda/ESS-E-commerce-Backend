import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { ProductController } from 'src/modules/product/product.controller';
import { ProductRepository } from 'src/modules/product/product.repository';
import { ProductService } from 'src/modules/product/product.service';

import { ProductMapping } from './product.mapping';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, ProductMapping],
  imports: [PrismaModule],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}
