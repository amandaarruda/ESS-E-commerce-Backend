import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';

import { ItensService } from './itens.service';

describe('ItensService', () => {
  let service: ItensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItensService],
    }).compile();

    service = module.get<ItensService>(ItensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
