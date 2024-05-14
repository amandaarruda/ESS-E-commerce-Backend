import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '@prisma/client';
import { MessagesHelperKey, getMessage } from 'src/utils/messages.helper';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthRequest } from '../models/AuthRequest';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  private readonly _logger = new Logger('Roles.Guard');

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = context.switchToHttp().getRequest<AuthRequest>().user;

    if (user.role === RoleEnum.ADMIN) {
      return true;
    }

    const hasAllRolesNeeded = requiredRoles.some(
      requiredRole => requiredRole == user.role,
    );

    const message = hasAllRolesNeeded ? 'has' : 'has no';

    const url = context.switchToHttp().getRequest<AuthRequest>().url;
    this._logger.log(`User ${user.email} ${message} permission to ${url}`);

    if (!hasAllRolesNeeded) {
      throw new ForbiddenException(
        getMessage(MessagesHelperKey.NOT_AUTHORIZED_RESOURCE),
      );
    }

    return hasAllRolesNeeded;
  }
}
