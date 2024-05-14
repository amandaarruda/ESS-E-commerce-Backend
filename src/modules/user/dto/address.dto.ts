import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class AddressDto {
  @ApiProperty({
    example: 'PE',
    description: 'Uf of the address',
  })
  @IsNotEmpty({
    message: 'O campo de UF deve ser preenchido',
  })
  @MaxLength(2, {
    message: 'O campo de UF deve ter no máximo 2 caracteres',
  })
  uf: string;

  @ApiProperty({
    example: 'Recife',
    description: 'Neighborhood of the address',
  })
  @IsNotEmpty({
    message: 'O campo de bairro deve ser preenchido',
  })
  @MaxLength(200, {
    message: 'O campo de bairro deve ter no máximo 200 caracteres',
  })
  neighborhood: string;

  @ApiProperty({
    example: 'Recife',
    description: 'City of the address',
  })
  @IsNotEmpty({
    message: 'O campo de cidade deve ser preenchido',
  })
  @MaxLength(200, {
    message: 'O campo de cidade deve ter no máximo 200 caracteres',
  })
  city: string;

  @ApiProperty({
    example: 'Rua 1',
    description: 'Street of the address',
  })
  @IsNotEmpty({
    message: 'O campo de rua deve ser preenchido',
  })
  @MaxLength(200, {
    message: 'O campo de rua deve ter no máximo 200 caracteres',
  })
  street: string;

  @ApiProperty({
    example: '50000-000',
    description: 'Cep of the address',
  })
  @IsNotEmpty({
    message: 'O campo de CEP deve ser preenchido',
  })
  @MaxLength(9, {
    message: 'O campo de CEP deve ter no máximo 9 caracteres',
  })
  cep: string;

  @ApiProperty({
    example: '123',
    description: 'Number of the address',
  })
  @IsNotEmpty({
    message: 'O campo de número deve ser preenchido',
  })
  @MaxLength(50, {
    message: 'O campo de número deve ter no máximo 50 caracteres',
  })
  number: string;

  @ApiPropertyOptional({
    example: 'Complemento',
    description: 'Complement of the address',
  })
  @IsOptional()
  @MaxLength(200, {
    message: 'O campo de complemento deve ter no máximo 200 caracteres',
  })
  complement?: string;
}
