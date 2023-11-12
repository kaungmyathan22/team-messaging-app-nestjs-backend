import { UserEntity } from '@user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class OnlineUserEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  socketId: string;
  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
}
