import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }
  /** * Validates that the token has the right signature
   *
   * @param any $payload The payload of the user having the email and the id
   *
   * @return payload signature
   */

  async validate(payload: any) {
    return { email: payload.email, id: payload.id };
  }
}
