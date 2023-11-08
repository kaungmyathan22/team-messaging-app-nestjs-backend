import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
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
import Hashids from 'hashids';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { ProcessorType } from 'src/common/constants/process.constants';
import { QueueConstants } from 'src/common/constants/queue.constants';
import { EmailService } from 'src/features/email/email.service';
import { ChangePasswordDTO } from 'src/features/users/dto/change-password.dto';
import { UserEntity } from 'src/features/users/entities/user.entity';
import { UsersService } from 'src/features/users/users.service';
import { StringUtils } from 'src/utils/string';
import { EntityManager, Repository } from 'typeorm';
import { ForgotPasswordDTO } from '../dto/fogot-password.dto';
import { RegisterDTO } from '../dto/register.dto';
import { ResendVerificationEmailPayload } from '../dto/resend-verification-email.dto';
import { ResetPasswordDTO } from '../dto/reset-password.dto';
import { PasswordResetTokenEntity } from '../entities/password-reset-token.entity';
import { VerificationCodeEntity } from '../entities/verification-code.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    private emailService: EmailService,
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    @InjectQueue(QueueConstants.AuthEmailQueue) private emailQueue: Queue,
    @InjectRepository(PasswordResetTokenEntity)
    private passwordResetTokenRepository: Repository<PasswordResetTokenEntity>,
    @InjectRepository(VerificationCodeEntity)
    private verificationCodeRepository: Repository<VerificationCodeEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  authenticate(email: string, password: string) {
    return this.userService.authenticate({
      email,
      password,
    });
  }
  // this.bullService.
  async register(payload: RegisterDTO) {
    const user = await this.userService.create(payload);
    this.emailQueue.add(ProcessorType.VerificationEmail, { user });
    return user;
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
      return { success: true };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Passwrod reset link expired');
    }
  }

  async verifyEmail(token: string) {
    try {
      const hashIdsSecret = this.configService.get(
        EnvironmentConstants.HASH_IDS_SECRET,
      );
      const hashids = new Hashids(hashIdsSecret, 10);

      const decodedPayload: EmailConfirmationPayload = this.jwtService.verify(
        token,
        {
          secret: this.configService.get(
            EnvironmentConstants.CONFIRM_EMAIL_TOKEN_SECRET,
          ),
        },
      );
      const code = decodedPayload.flag;
      const userId = hashids.decode(decodedPayload.usub)[0] as number;
      const id = hashids.decode(decodedPayload.sub)[0] as number;

      const [user, verification] = await Promise.all([
        this.userService.findOne(userId),
        this.verificationCodeRepository.findOne({
          where: {
            id: id,
            code,
            user: {
              id: userId,
            },
          },
        }),
      ]);
      if (!user || !verification) {
        throw new Error();
      }
      await this.entityManager.transaction(async () => {
        await this.verificationCodeRepository.remove(verification);
        await this.userService.updateVerificationStatus(user, true);
      });
      return { message: 'Email verification successful.' };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Invalid confirmation link',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async resendVerifyEmail({ email }: ResendVerificationEmailPayload) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new HttpException(
        'User not found with this email address.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (user.verified) {
      throw new HttpException(
        'User email is already verified.',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.emailQueue.add(ProcessorType.VerificationEmail, { user });
    return user;
  }
}
