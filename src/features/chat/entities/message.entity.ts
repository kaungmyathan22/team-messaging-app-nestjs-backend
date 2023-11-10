import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ParticipantEntity } from './participant.entity';

@Entity()
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  content: string;
  @Column()
  content_type: string;
  @ManyToOne(() => ParticipantEntity, { onDelete: 'CASCADE' })
  participant: ParticipantEntity;
}
