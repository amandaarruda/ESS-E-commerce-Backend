import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { UserPayload } from 'src/auth/models/UserPayload';

const whiteUrls = ['/api/health', '/api/auth'];
const whiteListToken = ['/api/auth/me'];

@Injectable()
export class HTTPLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTPLogger');

  constructor(private readonly jwtService: JwtService) {}

  parseArgs(
    start: number,
    end: number,
    userRequestEmail: string,
    args: Record<string, any>,
  ) {
    const message = Object.entries(args)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ');

    this.logger.log(
      message +
        ` +${end - start}ms${
          userRequestEmail != null ? `| User: ${userRequestEmail}` : ''
        }`,
    );
  }

  use(request: Request, response: Response, next: NextFunction): void {
    const token = request?.headers?.authorization
      ?.replace('Bearer', '')
      ?.trim();

    let userRequestEmail: string = null;

    if (
      token &&
      token != 'null' &&
      token != null &&
      token != 'undefined' &&
      !whiteListToken.includes(request.url)
    ) {
      const decodedUser: UserPayload | any = this.jwtService.decode(token);
      if (decodedUser?.email != null) {
        userRequestEmail = decodedUser?.email;
      }
    }

    const { method, baseUrl } = request;

    if (whiteUrls.some(url => url == baseUrl)) {
      return next();
    }

    const start = Date.now();

    response.on('close', () => {
      const { statusCode } = response;
      const end = Date.now();
      this.parseArgs(start, end, userRequestEmail, {
        method: method,
        endpoint: baseUrl,
        status: statusCode,
        ...(!this.isEmptyBody(request.body) && {
          body: this.getRequestBodyManipulated(request.body),
        }),
      });
    });

    next();
  }

  getRequestBodyManipulated = (body: unknown): string => {
    const bodyRequestString = JSON.stringify(body);

    return bodyRequestString.replace(
      /("password"\s*:\s*")[^"]+(")/g,
      '$1*****$2',
    );
  };

  isEmptyBody = (body: any): boolean => {
    const bodyRequestString = JSON.stringify(body);
    if (
      bodyRequestString == '{}' ||
      bodyRequestString == '[]' ||
      bodyRequestString == '' ||
      bodyRequestString == null
    ) {
      return true;
    }
  };
}
