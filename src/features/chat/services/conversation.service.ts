import {
  CreateGroupConversationPayload,
  CreateOneToOneConversationPayload,
} from '@chat/dto/conversation-dto/create-conversation.dto';
import {
  ConversationEntity,
  ConversationType,
} from '@chat/entities/conversation.entity';
import { ParticipantEntity } from '@chat/entities/participant.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@user/entities/user.entity';
import { UsersService } from '@user/users.service';
import { In, Repository } from 'typeorm';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(ParticipantEntity)
    private readonly participantRepository: Repository<ParticipantEntity>,
    private readonly userService: UsersService,
  ) {}
  async createGroupConversation(
    user: UserEntity,
    { participants, name }: CreateGroupConversationPayload,
  ) {
    if (participants.includes(user.id)) {
      throw new BadRequestException(
        "You can't include yourself in the participants payload.",
      );
    }
    const users = await this.userService.findByIds(participants);
    if (users.length !== participants.length) {
      throw new BadRequestException(
        'Some of the users are not existed in the database.',
      );
    }

    const conversation = this.conversationRepository.create({
      name,
      admin: user,
      type: ConversationType.Group,
    });
    await this.conversationRepository.save(conversation);
    await Promise.all(
      [...users, user]
        .map((u) =>
          this.participantRepository.create({ user: u, conversation }),
        )
        .map((participant) => this.participantRepository.save(participant)),
    );
    return {
      message: 'Successfully create group conversation',
    };
  }

  async createOneToOneConversation(
    user: UserEntity,
    { participant: participantId }: CreateOneToOneConversationPayload,
  ) {
    if (user.id === participantId) {
      throw new BadRequestException(
        "You can't put yourself in the participant.",
      );
    }
    const participantUser = await this.userService.findOne(participantId);
    if (!participantUser) {
      throw new BadRequestException("Participant doesn't exist.");
    }
    const userIds = [participantId, user.id];
    const conversationIds = await this.participantRepository
      .createQueryBuilder('participant')
      .select('"conversationId"')
      .addSelect('COUNT("userId")', 'userCount')
      .where('"userId" IN (:...userIds)', { userIds })
      .groupBy('"conversationId"')
      .having('COUNT(DISTINCT "userId") = :userCount', {
        userCount: userIds.length,
      })
      .getRawMany();
    if (conversationIds.length > 0) {
      console.log(conversationIds);
      const conversations = await this.conversationRepository
        .createQueryBuilder('conversation')
        .where('"id" IN (:...conversationIds)', {
          conversationIds: conversationIds.map(
            ({ conversationId }) => conversationId,
          ),
        })
        .andWhere('"type" = :type', { type: 'OneToOne' })
        .getMany();
      if (conversations.length > 0) {
        throw new BadRequestException('Conversation already existed.');
      }
    }

    const conversation = this.conversationRepository.create({
      admin: user,
      type: ConversationType.OneToOne,
      name: participantUser.email,
    });
    await this.conversationRepository.save(conversation);
    await Promise.all(
      [participantUser, user]
        .map((p) =>
          this.participantRepository.create({
            conversation,
            user: p,
          }),
        )
        .map((p) => this.participantRepository.save(p)),
    );
    return {
      message: 'Successfully created one to one conversation',
    };
  }

  async getConversations(user: UserEntity) {
    const conversationIds = await this.participantRepository
      .createQueryBuilder('participant')
      .select('"conversationId"')
      .where('"userId" = :userId', { userId: user.id })
      .getRawMany();

    const conversations = await this.conversationRepository.find({
      where: {
        id: In(
          conversationIds.map(
            ({ conversationId }) => conversationId,
          ) as number[],
        ),
      },
      relations: ['participants'], // Assuming 'participants' is the name of the relation in ConversationEntity
    });

    return conversations;
  }
}
