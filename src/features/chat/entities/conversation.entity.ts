import { UserEntity } from '@user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ParticipantEntity } from './participant.entity';

export enum ConversationType {
  Group = 'Group',
  OneToOne = 'OneToOne',
}

@Entity()
export class ConversationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: ConversationType;

  @Column()
  name: string;

  @ManyToOne(() => UserEntity)
  admin: UserEntity;

  @OneToMany(
    () => ParticipantEntity,
    (pariticipant) => pariticipant.conversation,
  )
  participants: ParticipantEntity[];
}
