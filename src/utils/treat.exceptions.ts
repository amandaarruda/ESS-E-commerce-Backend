import { InternalServerErrorException, HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { isDevelopmentEnviroment, isTestEnviroment } from './environment';

export const handleError = (
  error: Error,
  optionals?: {
    message?: string;
  },
) => {
  if (isDevelopmentEnviroment()) {
    console.log(`[HandleError] ${error}`);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    throw new InternalServerErrorException(
      'Ocorreu um erro inesperado, procure o suporte',
    );
  }

  if (error instanceof HttpException) {
    // Se for uma exceção específica do NestJS common, relance-a
    throw error;
  } else {
    throw new InternalServerErrorException(
      optionals?.message
        ? optionals?.message
        : 'Ocorreu um erro inesperado, procure o suporte',
    );
  }
};
