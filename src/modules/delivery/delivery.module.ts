import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SoapModule } from 'nestjs-soap';

import { CorreiosController } from './delivery.controller';
import { CorreiosService } from './delivery.service';

@Module({
  imports: [
    SoapModule.register({
      clientName: 'SOAP_CORREIOS',
      uri: 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl',
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [CorreiosService],
  controllers: [CorreiosController],
  exports: [CorreiosService],
})
export class DeliveryModule {}
