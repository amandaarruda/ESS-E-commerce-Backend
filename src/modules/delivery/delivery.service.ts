import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CorreiosService {
  async calculateDeliveryTime(cep: string): Promise<number> {
    try {
      if (!this.isValidCep(cep)) {
        throw new InternalServerErrorException(
          'Endereço inválido. Por favor, insira um endereço válido.',
        );
      }

      const tempoEntrega = Math.floor(Math.random() * 6) + 3;
      return tempoEntrega;
    } catch (error) {
      this.handleError(error);
    }
  }

  private isValidCep(cep: string): boolean {
    const cepRegex = /^[0-9]{5}-[0-9]{3}$/;
    return cepRegex.test(cep);
  }

  private handleError(error: any): never {
    if (error.response && error.response.status === 404) {
      throw new InternalServerErrorException(
        'Endereço inválido. Por favor, insira um endereço válido.',
      );
    }
    throw new InternalServerErrorException('Erro ao calcular prazo de entrega');
  }
}
