import { AutoMap } from '@automapper/classes';
import { ApiResponseProperty } from '@nestjs/swagger';

export class ItensResponseDto {
  @AutoMap()
  @ApiResponseProperty({
    type: String,
    description: 'Identificador único do item',
  })
  id: string;

  @AutoMap()
  @ApiResponseProperty({
    type: String,
    description: 'Nome do item',
  })
  name: string;

  @AutoMap()
  @ApiResponseProperty({
    type: Number,
    description: 'Preço do item',
  })
  price: number;

  @AutoMap()
  @ApiResponseProperty({
    type: String,
    description: 'Descrição do item',
  })
  description: string;

  @AutoMap()
  @ApiResponseProperty({
    type: String,
    description: 'URL da imagem do item',
  })
  imageUrl: string;
}
