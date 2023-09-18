import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class PasswordResetTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
  @Column()
  code: string;
  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;
}
