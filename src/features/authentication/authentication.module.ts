import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueConstants } from 'src/common/constants/queue.constants';
import { EmailModule } from 'src/features/email/email.module';
import { UsersModule } from 'src/features/users/users.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { PasswordResetTokenEntity } from './entities/password-reset-token.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { AuthEmailProcessor } from './processor/email.processor';
import { RefreshTokenService } from './refresh-token.service';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    ConfigModule,
    EmailModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
    }),
    TypeOrmModule.forFeature([RefreshTokenEntity, PasswordResetTokenEntity]),
    BullModule.registerQueue({
      name: QueueConstants.emailQueue,
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    RefreshTokenService,
    AuthEmailProcessor,
  ],
})
export class AuthenticationModule {}
