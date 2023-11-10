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
  @ManyToOne(() => ConversationEntity, { onDelete: 'CASCADE' })
  conversation: ConversationEntity;
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;
  @Column({ default: 0 })
  read: number;
  @Column({ nullable: true })
  nickName: string;
}
