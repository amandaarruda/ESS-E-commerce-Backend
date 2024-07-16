import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CrudType, CrudTypeMap } from 'src/utils/base/ICrudTypeMap';

export class DefaultFilter<T extends CrudTypeMap> {
  @IsOptional()
  @ApiPropertyOptional()
  page?: number = 1;

  @IsOptional()
  @ApiPropertyOptional()
  perPage?: number = 10;

  @IsOptional()
  @ApiPropertyOptional()
  search?: string;

  @IsOptional()
  @ApiPropertyOptional()
  categoryId?: number;

  @IsOptional()
  @ApiPropertyOptional({
    example: {
      id: 'desc',
    },
  })
  orderBy?: T[CrudType.ORDER_BY] = { id: 'desc' };

  query: Record<string, any>[];

  where?: T[CrudType.WHERE];

  select?: T[CrudType.SELECT];
}
