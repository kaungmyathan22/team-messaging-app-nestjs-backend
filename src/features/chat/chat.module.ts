import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConversationEntity } from './entities/conversation.entity';
import { MessageEntity } from './entities/message.entity';
import { ParticipantEntity } from './entities/participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationEntity,
      ParticipantEntity,
      MessageEntity,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
