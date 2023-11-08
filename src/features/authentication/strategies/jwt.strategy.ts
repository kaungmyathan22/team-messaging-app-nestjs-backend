import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { UsersService } from 'src/features/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const cookieToken =
          req.cookies[configService.get(EnvironmentConstants.COOKIE_JWT_KEY)]; // Attempt to get token from cookies
        const headerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req); // Attempt to get token from headers
        return headerToken || cookieToken;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get(EnvironmentConstants.JWT_SECRET),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token =
      req.cookies[
        this.configService.get(EnvironmentConstants.COOKIE_JWT_KEY)
      ] || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const cacheKey = this.configService.get(
      EnvironmentConstants.USER_TOKEN_CACHE_KEY,
    );
    const token_from_cache = await this.cacheService.get(
      `${cacheKey}:${payload.id}`,
    );
    if (token_from_cache && token_from_cache === token) {
      return this.userService.findOne(payload.id);
    }
    return false;
  }
}
