import { SendMessagePayload } from '@chat/dto/message-dto/send-message.dto';
import { MessageEntity } from '@chat/entities/message.entity';
import { ParticipantEntity } from '@chat/entities/participant.entity';
import { PaginatedParamsDto } from '@common/dto/paginated-query.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@user/entities/user.entity';
import { MiscUtils } from '@utils/misc';
import { Repository } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(ParticipantEntity)
    private readonly participantRepository: Repository<ParticipantEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}
  async getParticipantByConversationIdOrFail(
    conversationId: number,
    userId: number,
  ) {
    const participant = await this.participantRepository.findOne({
      where: {
        conversation: {
          id: conversationId,
        },
        user: {
          id: userId,
        },
      },
    });
    if (!participant) {
      throw new NotFoundException('Convesation not found.');
    }
    return participant;
  }

  async sendMessage(
    conversationId: number,
    user: UserEntity,
    { content, type }: SendMessagePayload,
  ) {
    const participant = await this.getParticipantByConversationIdOrFail(
      conversationId,
      user.id,
    );
    const message = this.messageRepository.create({
      participant,
      content,
      content_type: type,
    });
    await this.messageRepository.save(message);
    participant.read = message.id;
    await this.participantRepository.save(participant);
    return {
      ...message,
      participant: undefined,
    };
  }
  async getMessages(
    conversationId: number,
    user: UserEntity,
    { page, pageSize }: PaginatedParamsDto,
  ) {
    const participant = await this.getParticipantByConversationIdOrFail(
      conversationId,
      user.id,
    );
    const skip = (page - 1) * pageSize;
    const [totalItems, data] = await Promise.all([
      this.messageRepository.count({
        where: {
          participant: {
            id: participant.id,
          },
        },
      }),
      this.messageRepository.find({
        where: {
          participant: {
            id: participant.id,
          },
        },
        take: pageSize,
        skip,
        order: {
          id: 'desc',
        },
      }),
    ]);
    const meta = MiscUtils.getPaginationMeta({ page, pageSize, totalItems });
    console.log(JSON.stringify(data));

    return {
      ...meta,
      data,
    };
  }
}
