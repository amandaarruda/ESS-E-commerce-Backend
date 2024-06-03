import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserPayload } from '../models/UserPayload';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.AT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: UserPayload) {
    return {
      id: payload?.id,
      iat: payload?.iat,
      exp: payload?.exp,
      email: payload?.email,
      role: payload?.role,
      status: payload?.status,
      name: payload?.name,
      sub: payload?.sub,
      createdAt: payload?.createdAt,
      deletedAt: payload?.deletedAt,
    };
  }
}
