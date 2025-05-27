import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies?.authToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: 'UnibeFilerSecretKey@*',
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, role: payload.role }; 
  }
}