import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Cache } from 'cache-manager';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { ChangePasswordDTO } from 'src/users/dto/change-password.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { RegisterDTO } from './dto/register.dto';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private refreshTokenService: RefreshTokenService,
  ) {}

  authenticate(email: string, password: string) {
    return this.userService.authenticate({
      email,
      password,
    });
  }

  register(payload: RegisterDTO) {
    return this.userService.create(payload);
  }

  getAccessToken(user: UserEntity) {
    const access_token = this.jwtService.sign({ id: user.id });
    const jwt_access_expiration_time = this.configService.get<number>(
      EnvironmentConstants.JWT_EXPIRES_IN,
    );
    console.log({ jwt_access_expiration_time });
    const cacheKey = this.configService.get(
      EnvironmentConstants.USER_TOKEN_CACHE_KEY,
    );
    this.cacheService.set(`${cacheKey}:${user.id}`, access_token, {
      ttl: jwt_access_expiration_time,
    } as any);
    return access_token;
  }

  async getRefreshToken(user: UserEntity) {
    const refresh_token = this.jwtService.sign(
      { id: user.id },
      {
        secret: this.configService.get(EnvironmentConstants.JWT_REFRESH_SECRET),
        expiresIn: this.configService.get(
          EnvironmentConstants.JWT_REFRESH_EXPIRES_IN,
        ),
      },
    );
    await this.refreshTokenService.upsertToken(refresh_token, user);
    return refresh_token;
  }

  async login(user: UserEntity) {
    // access_token
    const access_token = this.getAccessToken(user);
    // refresh_token
    const refresh_token = await this.getRefreshToken(user);
    return {
      user,
      access_token,
      refresh_token,
    };
  }

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

  logout(user: UserEntity) {
    const userKey = this.configService.get(
      EnvironmentConstants.USER_TOKEN_CACHE_KEY,
    );
    return this.cacheService.del(`${userKey}:${user.id}`);
  }

  async deleteMyAccount(user: UserEntity) {
    await this.userService.deleteUser(user);
    return { success: true };
  }

  async changePassword(user: UserEntity, payload: ChangePasswordDTO) {
    const { newPassword, oldPassword } = payload;
    // 1. old password must correct
    const isOldPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.password,
    );
    if (!isOldPasswordCorrect) {
      throw new BadRequestException('Incorrect old password.');
    }

    // 2. new password shouldn't be the same with old password
    const isMatchWithOldPassword = await bcrypt.compare(
      newPassword,
      user.password,
    );
    if (isMatchWithOldPassword) {
      throw new BadRequestException(
        "New password can't be the same with the old password. Please choose different one.",
      );
    }
    // 3. change password
    await this.userService.updatePassword(newPassword, user);
    // log the user out.
    await this.logout(user);
    return { success: true };
  }

  resetPassword(user: UserEntity) {
    throw new NotImplementedException('need to implmeents this.');
  }
}
