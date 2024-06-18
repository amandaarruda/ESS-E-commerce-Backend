import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category, Itens } from '@prisma/client';
import { CategoryResponseDto } from 'src/modules/categories/dto/response/category.dto';
import { CategoryEntity } from 'src/modules/categories/entity/category.entity';

export class ItensEntity implements Itens {
  @ApiProperty({
    type: Number,
    description: 'The unique identifier for the item',
    example: 123,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: 'The name of the item',
    example: 'abc',
  })
  name: string;

  @ApiProperty({
    type: Number,
    description: 'The price of the item',
    example: '4.00',
  })
  price: GLfloat;

  @ApiProperty({
    type: Number,
    description: 'The quantity of the item',
    example: '4',
  })
  stock: number;

  @ApiProperty({
    type: Number,
    description: 'The id of the category of the item',
    example: '01',
  })
  categoryId: number;

  @ApiProperty({
    type: CategoryResponseDto,
    description: 'The category of the item',
    example: 'tênis',
  })
  category: CategoryResponseDto;

  @ApiProperty({
    type: String,
    description: 'The description of the item',
    example: 'abcde fghi',
  })
  description: string;

  @ApiProperty({
    type: String,
    description: 'The URL of the image of the item',
    example: 'www.abcde.com',
  })
  imageUrl: string;
}
