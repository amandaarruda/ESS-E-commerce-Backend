import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Address } from '@prisma/client';

export class AddressEntity implements Address {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'The unique identifier for the media',
  })
  @AutoMap()
  id: number;

  @ApiProperty({
    example: 'PE',
    description: 'Uf of the address',
  })
  uf: string;

  @ApiProperty({
    example: 'Recife',
    description: 'Neighborhood of the address',
  })
  neighborhood: string;

  @ApiProperty({
    example: 'Recife',
    description: 'City of the address',
  })
  city: string;

  @ApiProperty({
    example: 'Rua 1',
    description: 'Street of the address',
  })
  street: string;

  @ApiProperty({
    example: '50000-000',
    description: 'Cep of the address',
  })
  cep: string;

  @ApiProperty({
    example: '123',
    description: 'Number of the address',
  })
  number: string;

  @ApiProperty({
    example: 'Complemento',
    description: 'Complement of the address',
  })
  complement: string;
}
