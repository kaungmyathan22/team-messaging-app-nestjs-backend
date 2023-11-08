import * as bcrypt from 'bcryptjs';
import { UserEntity } from 'src/features/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  refreshTokenHash: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;

  @Column({
    type: 'timestamptz',
  })
  expirationTime: Date;

  async isTokenMatch(plainText: string) {
    try {
      return bcrypt.compare(plainText, this.refreshTokenHash);
    } catch (error) {
      return false;
    }
  }
}
