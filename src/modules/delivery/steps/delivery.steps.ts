import { HttpService, HttpModule } from '@nestjs/axios';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { defineFeature, loadFeature } from 'jest-cucumber';
import * as path from 'path';
import { of, throwError } from 'rxjs';

import { CorreiosService } from '../delivery.service';

const feature = loadFeature(path.join('features/orderDeliveryTime.feature'));
const mockHttpService = {
  get: jest.fn(),
};

let service: CorreiosService;
let result: number | undefined;
let error: InternalServerErrorException | undefined;

defineFeature(feature, test => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        CorreiosService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<CorreiosService>(CorreiosService);
  });

  test('Calcular o tempo estimado de entrega', ({ when, then, and }) => {
    when(/^o usuário cliente insere o CEP "(.*)"$/, async cep => {
      const mockResponse = {
        data: { prazoEntrega: 5 },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));
      result = await service.calculateDeliveryTime(cep);
      console.log(
        `Prazo de entrega calculado com sucesso para o CEP ${cep}: ${result} dias úteis`,
      );
    });

    then(
      /^o sistema calcula o tempo de entrega para CEP "(.*)" de acordo com a distância para a distribuidora da loja$/,
      cep => {
        expect(result).toBeGreaterThan(0);
        expect(result).toBe(5);
      },
    );

    and(/^o serviço deve retornar "(.*)"$/, mensagem => {
      const expectedMessage = `Entrega estimada em ${result} dias úteis`;
      expect(expectedMessage).toBe(mensagem);
    });
  });

  test('Notificar o cliente quando o endereço de entrega é inválido ou inexistente', ({
    when,
    then,
    and,
  }) => {
    when(/^o usuário cliente insere o endereço de CEP "(.*)"$/, async cep => {
      console.log(`Usuário inseriu o CEP: ${cep}`);
      mockHttpService.get.mockReturnValue(
        throwError(() => ({
          response: {
            status: 404,
          },
        })),
      );
      try {
        await service.calculateDeliveryTime(cep);
      } catch (err) {
        error = err;
        console.log(`Erro ao calcular o tempo de entrega para o CEP ${cep}`);
      }
    });

    then(
      /^o sistema tenta calcular o tempo de entrega para o CEP "(.*)" e não consegue encontrá-lo$/,
      cep => {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe(
          'Endereço inválido. Por favor, insira um endereço válido.',
        );
      },
    );

    and(/^o serviço deve retornar uma mensagem de erro "(.*)"$/, mensagem => {
      expect(error.message).toContain(
        'Endereço inválido. Por favor, insira um endereço válido.',
      );
    });
  });
});
