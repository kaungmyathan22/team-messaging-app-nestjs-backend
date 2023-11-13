import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import * as joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentConstants } from './common/constants/environment.constants';
import { CookieMiddleware } from './common/middlewares/cookie.middleware';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './features//users/users.module';
import { AuthenticationModule } from './features/authentication/authentication.module';
import { ChatModule } from './features/chat/chat.module';
import { EmailModule } from './features/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        POSTGRES_USER: joi.string().required(),
        POSTGRES_PASSWORD: joi.string().required(),
        POSTGRES_DB: joi.string().required(),
        PORT: joi.string().required(),
        POSTGRES_HOST: joi.string().required(),
        POSTGRES_PORT: joi.string().required(),
        SYNCHONRIZE: joi.boolean().required(),
        JWT_SECRET: joi.string().required(),
        JWT_EXPIRES_IN: joi.number().required(),
        JWT_REFRESH_SECRET: joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: joi.number().required(),
        REDIS_HOST: joi.string().required(),
        USER_TOKEN_CACHE_KEY: joi.string().required(),
        COOKIE_JWT_KEY: joi.string().required(),
        COOKIE_REFRESH_JWT_KEY: joi.string().required(),
        REDIS_PORT: joi.number().required(),
        CONFIRM_EMAIL_TOKEN_SECRET: joi.string().required(),
        CONFIRM_EMAIL_TOKEN_EXPIRES_IN: joi.number().required(),
        HASH_IDS_SECRET: joi.string().required(),
        FRONTNED_URL: joi.string().required(),
      }),
    }),
    UsersModule,
    AuthenticationModule,
    DatabaseModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
      }),
    }),
    EmailModule,
    ChatModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          redis: {
            host: configService.get(EnvironmentConstants.REDIS_HOST),
            port: configService.get(EnvironmentConstants.REDIS_PORT),
          },
        };
      },
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieMiddleware).forRoutes('*');
  }
}
