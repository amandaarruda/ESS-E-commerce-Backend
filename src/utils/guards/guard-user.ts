import { NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { StatusEnum } from '@prisma/client';
import {
  MessagesHelperKey,
  getMessage,
  setMessage,
} from 'src/utils/messages.helper';

export const guardUser = (
  user: {
    email: string;
    status: StatusEnum;
    deletedAt: Date | null;
  },
  logger: Logger,
  optionals?: {
    requestUserEmail?: string;
  },
) => {
  if (!user || Object.values(user).every(value => value === undefined)) {
    logger.debug(`User not found`);
    throw new NotFoundException(
      setMessage(
        getMessage(MessagesHelperKey.USER_NOT_FOUND),
        user?.email ?? optionals?.requestUserEmail,
      ),
    );
  }

  if (user?.status === StatusEnum.INACTIVE || user?.deletedAt != null) {
    logger.debug(`User inactivated`);
    throw new ForbiddenException(
      setMessage(
        getMessage(MessagesHelperKey.USER_INACTIVE_TRYING_ACCESS),
        user?.email,
      ),
    );
  }
};
