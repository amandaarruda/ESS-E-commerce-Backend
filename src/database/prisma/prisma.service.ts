import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { isDevelopmentEnviroment } from 'src/utils/environment';

@Injectable()
export class PrismaService extends PrismaClient<
  Prisma.PrismaClientOptions,
  'query' | 'error' | 'debug' | 'info'
> {
  private readonly logger = new Logger(PrismaService.name);

  private readonly debug = isDevelopmentEnviroment();

  private readonly showQuery = false && isDevelopmentEnviroment();

  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });

    this.logger.log(`Prisma v${Prisma.prismaVersion.client}`);

    if (this.debug) {
      if (this.showQuery) {
        this.$on('query', e => {
          console.log('Query: ' + e.query);
          console.log('Params: ' + e.params);
          console.log('Duration: ' + e.duration + 'ms');
        });
      }

      this.$use(async (params, next) => {
        const before = Date.now();

        const result = await next(params);

        const after = Date.now();

        this.logger.debug(
          `Query ${params.model}.${params.action} took ${after - before}ms`,
        );

        return result;
      });
    }
  }
}
