import { IsNotEmpty, IsOptional } from 'class-validator';

export class createOrderDTO {
  @IsNotEmpty({
    message: 'Usuário é obrigatório',
  })
  userId: number;

  @IsNotEmpty({
    message: 'Código do pedido é obrigatório',
  })
  code: string;

  @IsNotEmpty({
    message: 'Preço é obrigatório',
  })
  price: number;

  @IsNotEmpty({
    message: 'Email é obrigatório',
  })
  email: string;

  @IsOptional()
  estimatedDelivery?: Date;
}
