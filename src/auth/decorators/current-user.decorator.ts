import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthRequest } from '../models/AuthRequest';
import { UserPayload } from '../models/UserPayload';

export const AuthenticatedUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserPayload => {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    if (request.user && request.user.id) {
      return request.user;
    }
  },
);
