import { AuthenticationModule } from '@auth/authentication.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@user/users.module';
import { ConversationController } from './controllers/conversation.controller';
import { MessageController } from './controllers/message.controller';
import { ConversationEntity } from './entities/conversation.entity';
import { MessageEntity } from './entities/message.entity';
import { ParticipantEntity } from './entities/participant.entity';
import { ChatGateway } from './gateway/chat.gateway';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
    }),
    AuthenticationModule,
    UsersModule,
    TypeOrmModule.forFeature([
      ConversationEntity,
      ParticipantEntity,
      MessageEntity,
    ]),
  ],
  controllers: [ConversationController, MessageController],
  providers: [ConversationService, MessageService, ChatGateway],
})
export class ChatModule {}
