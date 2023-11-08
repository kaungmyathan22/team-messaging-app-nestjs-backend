import { ConfigService } from '@nestjs/config';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';

export class CookieService {
  constructor(private readonly configService: ConfigService) {}
  getCookieWithJwtToken(token: string) {
    const cookieJwtKey = this.configService.get(
      EnvironmentConstants.COOKIE_JWT_KEY,
    );
    const cookieJwtExpiresIn = +this.configService.get(
      EnvironmentConstants.JWT_EXPIRES_IN,
    );
    return `${cookieJwtKey}=${token}; HttpOnly; Path=/; Max-Age=${cookieJwtExpiresIn}`;
  }

  getCookieWithJwtRefreshToken(refreshToken: string) {
    const cookieRefreshJwtKey = this.configService.get(
      EnvironmentConstants.COOKIE_REFRESH_JWT_KEY,
    );
    const cookieRefreshExpiresIn = +this.configService.get(
      EnvironmentConstants.JWT_REFRESH_EXPIRES_IN,
    );
    return `${cookieRefreshJwtKey}=${refreshToken}; HttpOnly; Path=/; Max-Age=${cookieRefreshExpiresIn}`;
  }

  getCookieForLogOut() {
    const cookieJwtKey = this.configService.get(
      EnvironmentConstants.COOKIE_JWT_KEY,
    );
    const cookieRefreshJwtKey = this.configService.get(
      EnvironmentConstants.COOKIE_REFRESH_JWT_KEY,
    );

    return [
      `${cookieJwtKey}=; HttpOnly; Path=/; Max-Age=0`,
      `${cookieRefreshJwtKey}=; HttpOnly; Path=/; Max-Age=0`,
    ];
  }
}
