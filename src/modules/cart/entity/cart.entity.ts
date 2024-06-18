import { ApiProperty } from '@nestjs/swagger';
import { Cart } from '@prisma/client';

export class CartEntity implements Cart {
  @ApiProperty({
    type: Number,
    description: 'The unique identifier for the cart',
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: Number,
    description: 'The unique identifier for the user associated with this cart',
    example: 123,
  })
  userId: number;

  @ApiProperty({
    type: Boolean,
    description: 'Indicates if the cart is locked',
    example: false,
  })
  locked: boolean;

  // The products property will be an array of CartProduct entities
  // You will need to create a CartProductEntity class similar to this one
  // and use it here as the type for this property.
}
