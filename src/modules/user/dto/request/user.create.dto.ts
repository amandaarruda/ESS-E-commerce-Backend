import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';


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
    description: 'senha do usuário',
    example: '123@1Bre88',
  })
  @IsOptional()
  @IsString({ message: 'O campo de senha deve ser uma string' })
  @MaxLength(255, {
    message: 'O campo password deve ter menos de 255 caracteres',
  })
  @MinLength(3, {
    message: 'O campo password deve ter mais de 3 caracteres',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W|_)[\S]{8,}$/, {
    message:
      'A senha deve conter no mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
  })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim(),
  )
  password: string;

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
