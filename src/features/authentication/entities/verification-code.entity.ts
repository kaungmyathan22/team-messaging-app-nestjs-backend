import { UserEntity } from 'src/features/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

enum VerificationCodeEnum {
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
}

@Entity()
export class VerificationCodeEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
  @Column()
  code: string;
  @Column({
    type: 'enum',
    enum: VerificationCodeEnum,
    default: VerificationCodeEnum.PASSWORD_RESET,
  })
  type: VerificationCodeEnum;
  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;
}
