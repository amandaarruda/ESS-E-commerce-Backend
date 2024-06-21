import { HttpService } from '@nestjs/axios';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CorreiosService {
  constructor(private readonly httpService: HttpService) {}

  async calculateDeliveryTime(cep: string): Promise<number> {
    try {
      const response = await this.httpService
        .get(`https://api.correios.com.br/${cep}`)
        .toPromise();

      const prazoEntrega = response.data.prazoEntrega;

      if (!prazoEntrega) {
        throw new BadRequestException(
          'Endereço inválido. Por favor, insira um endereço válido.',
        );
      }

      return parseInt(prazoEntrega);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new BadRequestException(
          'Endereço inválido. Por favor, insira um endereço válido.',
        );
      }
      throw new BadRequestException('Erro ao calcular prazo de entrega');
    }
  }
}
