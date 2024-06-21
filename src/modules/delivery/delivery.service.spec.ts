import { HttpService } from '@nestjs/axios';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

import { CorreiosService } from './delivery.service';

describe('CorreiosService', () => {
  let service: CorreiosService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorreiosService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(() =>
              of({ data: { Servicos: { cServico: [{ PrazoEntrega: '2' }] } } }),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<CorreiosService>(CorreiosService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate delivery time', async () => {
    const cepDestino = '50030-230';
    const tempoEntrega = await service.calculateDeliveryTime(cepDestino);
    expect(tempoEntrega).toBe(2);
  });

  it('should throw BadRequestException on error', async () => {
    const cepDestino = '00000-000';
    jest.spyOn(httpService, 'get').mockImplementationOnce(() => {
      throw new BadRequestException('Erro ao calcular prazo de entrega');
    });
    await expect(service.calculateDeliveryTime(cepDestino)).rejects.toThrow(
      BadRequestException,
    );
  });
});
