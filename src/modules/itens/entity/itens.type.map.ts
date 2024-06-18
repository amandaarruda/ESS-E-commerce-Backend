import { Prisma } from '@prisma/client';
import { CrudTypeMap } from 'src/utils/base/ICrudTypeMap';

export class ItensTypeMap implements CrudTypeMap {
  aggregate: Prisma.ItensAggregateArgs;
  count: Prisma.ItensCountArgs;
  create: Prisma.ItensCreateInput;
  createUnchecked: Prisma.ItensUncheckedCreateInput;
  delete: Prisma.ItensDeleteArgs;
  deleteMany: Prisma.ItensDeleteManyArgs;
  findFirst: Prisma.ItensFindFirstArgs;
  findMany: Prisma.ItensFindManyArgs;
  findUnique: Prisma.ItensFindUniqueArgs;
  update: Prisma.ItensUpdateInput;
  updateMany: Prisma.ItensUpdateManyArgs;
  upsert: Prisma.ItensUpsertArgs;
  where: Prisma.ItensWhereInput;
  select: Prisma.ItensSelect;
  orderBy: Prisma.ItensOrderByWithRelationInput;
}
