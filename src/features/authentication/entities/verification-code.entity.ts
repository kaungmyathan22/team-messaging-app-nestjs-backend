import { UserEntity } from 'src/features/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum VerificationCodeEnum {
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
}

@Entity()
@Unique('verification_entity_unique_together', ['user', 'code', 'type'])
export class VerificationCodeEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => UserEntity)
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
