import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtCookieStrategy extends PassportStrategy(Strategy, 'jwt-cookie') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        if (!req || !req.cookies) return null;
        return req.cookies['authToken'];
      },
      ignoreExpiration: false,
      secretOrKey: 'UnibeFilerSecretKey@*',
    });
  }

  async validate(payload: any) {
    return {
      sub: payload.sub,
      role: payload.role
    };
  }
}