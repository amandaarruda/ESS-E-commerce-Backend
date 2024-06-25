import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class EmailDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'emailusuario@gmail.com',
  })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim() && value?.toLowerCase(),
  )
  email: string;
}
