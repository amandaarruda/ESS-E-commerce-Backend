import { ApiProperty } from '@nestjs/swagger';

export class MediaEntity {
  id: number;

  @ApiProperty({
    type: String,
    description: 'The URL of the media',
    example: 'https://example.com/media/image.jpg',
  })
  url: string;
}
