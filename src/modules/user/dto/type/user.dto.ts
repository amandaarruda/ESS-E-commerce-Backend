import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiResponseProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @AutoMap()
  id: number;

  @ApiResponseProperty({
    example: '03/11/2024',
  })
  @AutoMap()
  createdAt: Date | any;

  @ApiResponseProperty({
    example: '2024-05-12T21:40:59.058Z',
  })
  @AutoMap()
  updatedAt: Date | any;

  @ApiResponseProperty({
    example: '2024-05-12T21:40:59.058Z',
  })
  @AutoMap()
  deletedAt: Date | any;

  @ApiProperty({
    description: 'Status do registro',
    example: 'Ativo',
  })
  @AutoMap()
  status: any;

  @AutoMap()
  role: string;
}
