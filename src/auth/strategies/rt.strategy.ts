import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserPayload } from '../models/UserPayload';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.RT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: UserPayload) {
    const refreshToken = request?.headers?.authorization
      .replace('Bearer', '')
      .trim();

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
      refreshToken,
    };
  }
}
