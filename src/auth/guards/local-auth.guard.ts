import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesHelperKey, getMessage } from 'src/utils/messages.helper';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    if (err) throw err;

    if (!user) {
      throw new UnauthorizedException(
        getMessage(MessagesHelperKey.PASSWORD_OR_EMAIL_INVALID),
      );
    }

    return user;
  }
}
