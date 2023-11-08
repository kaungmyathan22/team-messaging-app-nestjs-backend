import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { UsersService } from 'src/features/users/users.service';
import { RefreshTokenService } from '../refresh-token.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const cookieRefreshToken =
          req.cookies[
            configService.get(EnvironmentConstants.COOKIE_REFRESH_JWT_KEY)
          ]; // Attempt to get token from cookies
        const headerRefreshToken = ExtractJwt.fromExtractors([
          (request: Request) => {
            return request?.cookies?.Refresh;
          },
        ])(req);
        return headerRefreshToken || cookieRefreshToken;
      },
      secretOrKey: configService.get(EnvironmentConstants.JWT_REFRESH_SECRET),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload) {
    const refreshToken = request.cookies?.Refresh;
    const isTokenValid = await this.refreshTokenService.isRefreshTokenValid(
      payload.id,
      refreshToken,
    );
    if (isTokenValid) {
      return await this.userService.findOne(payload.id);
    }
  }
}
