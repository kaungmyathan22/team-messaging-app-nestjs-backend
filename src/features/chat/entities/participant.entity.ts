import { UserEntity } from '@user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ConversationEntity } from './conversation.entity';

@Entity()
@Unique(['conversation', 'user'])
export class ParticipantEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => ConversationEntity)
  conversation: ConversationEntity;
  @ManyToOne(() => UserEntity)
  user: UserEntity;
  @Column()
  read: number;
  @Column()
  nickName: string;
}
