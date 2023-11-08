import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrimaryUserService } from 'src/users/services';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    private primaryUserService: PrimaryUserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: { sub: any }) {
    let user;
    // find user in primary user collection
    user = await this.primaryUserService.getUserById(payload.sub);
    // if not found there, check in admin or other users collections
    if (user === null) {
      return false;
    }

    // delete user.password;

    return user;
  }
}
