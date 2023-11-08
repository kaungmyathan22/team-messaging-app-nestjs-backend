import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { QueueConstants } from 'src/common/constants/queue.constants';
import { EmailService } from 'src/features/email/email.service';
import { ChangePasswordDTO } from 'src/features/users/dto/change-password.dto';
import { UserEntity } from 'src/features/users/entities/user.entity';
import { UsersService } from 'src/features/users/users.service';
import { StringUtils } from 'src/utils/string';
import { Repository } from 'typeorm';
import { ForgotPasswordDTO } from './dto/fogot-password.dto';
import { RegisterDTO } from './dto/register.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { PasswordResetTokenEntity } from './entities/password-reset-token.entity';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private emailService: EmailService,
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private refreshTokenService: RefreshTokenService,
    @InjectQueue(QueueConstants.emailQueue) private emailQueue: Queue,
    @InjectRepository(PasswordResetTokenEntity)
    private passwordResetTokenRepository: Repository<PasswordResetTokenEntity>,
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

  async forgotPassword(payload: ForgotPasswordDTO) {
    const { email } = payload;
    const user = await this.userService.findByEmail(email);
    if (user) {
      const code = StringUtils.generateRandomString(20);
      const now = new Date();
      const existingResetTokenInstance =
        await this.passwordResetTokenRepository.findOne({
          where: { user: { id: user.id } },
        });
      const resetTokenInstance = existingResetTokenInstance
        ? existingResetTokenInstance
        : this.passwordResetTokenRepository.create({
            user,
          });
      resetTokenInstance.code = code;
      resetTokenInstance.expiresAt = new Date(
        now.setHours(now.getHours() + 24),
      );
      const token = this.jwtService.sign(
        { email: user.email, code },
        {
          secret: this.configService.get(
            EnvironmentConstants.PASSWORD_RESET_TOKEN_SECRET,
          ),
          expiresIn: +this.configService.get(
            EnvironmentConstants.PASSWORD_RESET_TOKEN_EXPIRES_IN,
          ),
        },
      );
      const frontendURL = this.configService.get(
        EnvironmentConstants.FRONTNED_URL,
      );
      await Promise.all([
        this.passwordResetTokenRepository.save(resetTokenInstance),
        this.emailService.sendEmail({
          to: 'hello@gmail.com',
          template: 'forgot-password',
          subject: 'Password Reset Link',
          context: {
            resetLink: `${frontendURL}/?token=${token}`,
          },
        }),
      ]);
    }
    return { success: true };
  }

  async resetPassword({ newPassword, token }: ResetPasswordDTO) {
    try {
      const { code, email } = await this.jwtService.verify(token, {
        secret: this.configService.get(
          EnvironmentConstants.PASSWORD_RESET_TOKEN_SECRET,
        ),
      });
      const [user, resetTokenInstance] = await Promise.all([
        this.userService.findByEmail(email),
        this.passwordResetTokenRepository.findOne({
          where: {
            code,
            user: { email },
          },
        }),
      ]);
      if (!resetTokenInstance) {
        throw new Error();
      }
      if (resetTokenInstance.expiresAt < new Date()) {
        throw new Error();
      }
      await Promise.all([
        this.userService.updatePassword(newPassword, user),
        this.passwordResetTokenRepository.remove(resetTokenInstance),
      ]);
      return { success: true, resetTokenInstance };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Passwrod reset link expired');
    }
  }
}
