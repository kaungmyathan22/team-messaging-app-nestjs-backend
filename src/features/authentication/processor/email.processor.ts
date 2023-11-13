import { Process, Processor } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import Hashids from 'hashids';
import { EnvironmentConstants } from 'src/common/constants/environment.constants';
import { ProcessorType } from 'src/common/constants/process.constants';
import { QueueConstants } from 'src/common/constants/queue.constants';
import { EmailService } from 'src/features/email/email.service';
import { UserEntity } from 'src/features/users/entities/user.entity';
import { StringUtils } from 'src/utils/string';
import { Repository } from 'typeorm';
import {
  VerificationCodeEntity,
  VerificationCodeEnum,
} from '../entities/verification-code.entity';

@Processor(QueueConstants.AuthEmailQueue)
export class AuthEmailProcessor {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @InjectRepository(VerificationCodeEntity)
    private verificationCodeRepository: Repository<VerificationCodeEntity>,
  ) {}
  @Process(ProcessorType.ForgotPassword)
  async handleSendForgotPasswordEmail(job: Job) {
    job.finished();
  }

  @Process(ProcessorType.VerificationEmail)
  async handleSendVerificationEmail(job: Job) {
    try {
      const frontendURL = this.configService.get(
        EnvironmentConstants.FRONTNED_URL,
      );
      const user = job.data?.user as UserEntity;
      const hashIdsSecret = this.configService.get(
        EnvironmentConstants.HASH_IDS_SECRET,
      );
      const hashids = new Hashids(hashIdsSecret, 10);
      const code = StringUtils.generateRandomString(20);
      const expiresIn = this.configService.get<number>(
        EnvironmentConstants.CONFIRM_EMAIL_TOKEN_EXPIRES_IN,
      );
      const d = new Date();
      d.setSeconds(d.getSeconds() + expiresIn);
      const verficationInstance = await this.verificationCodeRepository.upsert(
        {
          user,
          code,
          expiresAt: d,
          type: VerificationCodeEnum.EMAIL_VERIFICATION,
        },
        ['user', 'code', 'type'],
      );
      const id = verficationInstance.identifiers[0].id;
      const hashedId = hashids.encode(id);
      const hashedUserId = hashids.encode(user.id);
      const token = this.jwtService.sign(
        {
          sub: hashedId,
          usub: hashedUserId,
          flag: code,
        },
        {
          expiresIn,
          secret: this.configService.get(
            EnvironmentConstants.CONFIRM_EMAIL_TOKEN_SECRET,
          ),
        },
      );
      const confirmationLink = `${frontendURL}?token=${token}`;
      await this.emailService.sendEmail({
        to: user.email,
        template: 'confirmation',
        subject: 'Confirm your email',
        context: {
          confirmationLink,
        },
      });
      job.finished();
    } catch (error) {}
  }
}
