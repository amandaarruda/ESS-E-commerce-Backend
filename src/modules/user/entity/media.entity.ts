import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Media } from '@prisma/client';

export class MediaEntity implements Media {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'The unique identifier for the media',
  })
  @AutoMap()
  id: number;

  @ApiProperty({
    example: 'www.google.com.br',
    description: 'The Media Url',
  })
  @AutoMap()
  url: string;
}
