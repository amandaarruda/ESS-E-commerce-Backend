import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';


export class UserUpdateDto {
  @ApiProperty({
    description: 'Versão do usuário',
    example: 3,
  })
  @IsNumber({}, { message: 'O campo de versão deve ser um número' })
  @IsNotEmpty({ message: 'A versão é obrigatória' })
  version: number;

  @ApiPropertyOptional({
    example: 'Breno Silva',
    description: 'Nome do usuário',
  })
  @IsOptional()
  @IsString({ message: 'O campo de nome deve ser uma string' })
  @MaxLength(200, {
    message: 'O campo de nome deve ter menos de 200 caracteres',
  })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim(),
  )
  name?: string;

  @ApiPropertyOptional({
    example: 'emailusuario@gmail.com',
    description: 'E-mail do usuário',
  })
  @IsOptional()
  @IsEmail({}, { message: 'O campo de email deve ser um e-mail válido' })
  @MaxLength(200, {
    message: 'O campo de email deve ter menos de 200 caracteres',
  })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim() && value?.toLowerCase(),
  )
  email?: string;

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
  telephone?: string;

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
