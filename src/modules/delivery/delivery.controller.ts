import { Controller, Get, Param, BadRequestException } from '@nestjs/common';

import { CorreiosService } from './delivery.service';

@Controller('correios')
export class CorreiosController {
  constructor(private readonly correiosService: CorreiosService) {}

  @Get('tempo-entrega/:cepDestino')
  async calcularTempoEntrega(
    @Param('cepDestino') cepDestino: string,
  ): Promise<{ tempoEntrega: number }> {
    try {
      const tempoEntrega =
        await this.correiosService.calculateDeliveryTime(cepDestino);
      return { tempoEntrega };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
