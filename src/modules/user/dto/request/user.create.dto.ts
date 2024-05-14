import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { AddressDto } from '../address.dto';

export class UserCreateDto {
  @ApiProperty({
    example: 'emailusuario@gmail.com',
    description: 'E-mail do usuário',
  })
  @IsNotEmpty({ message: 'O campo de email deve ser preenchido' })
  @IsEmail({}, { message: 'O campo de email deve ser um e-mail válido' })
  @MaxLength(200, {
    message: 'O campo de email deve ter menos de 200 caracteres',
  })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim() && value?.toLowerCase(),
  )
  email: string;

  @ApiProperty({
    example: 'Breno Silva',
    description: 'Nome do usuário',
  })
  @IsNotEmpty({ message: 'O campo de nome deve ser preenchido' })
  @IsString({ message: 'O campo de nome deve ser uma string' })
  @MaxLength(200, {
    message: 'O campo de nome deve ter menos de 200 caracteres',
  })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim(),
  )
  name: string;

  @ApiProperty({
    example: '(81) 98888-8888',
    description: 'Telefone do usuário',
  })
  @IsNotEmpty({ message: 'O campo de telephone deve ser preenchido' })
  @IsString({ message: 'O campo de telephone deve ser uma string' })
  @MaxLength(20, {
    message: 'O campo de telephone deve ter no máximo de 20 caracteres',
  })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim(),
  )
  telephone: string;

  @Type(() => AddressDto)
  @ValidateNested({ each: true })
  @IsNotEmpty({ message: 'O campo de endereço deve ser preenchido' })
  address: AddressDto;

  @ApiPropertyOptional({
    example: 'Imagem do usuário',
    description: 'www.google.com.br',
  })
  @IsOptional()
  @IsString({ message: 'O campo de imagem deve ser uma string' })
  @MaxLength(200, {
    message: 'O campo de imagem deve ter menos de 200 caracteres',
  })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim(),
  )
  image?: string;
}
