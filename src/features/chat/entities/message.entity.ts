import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ConversationEntity } from './conversation.entity';
import { ParticipantEntity } from './participant.entity';

@Entity()
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  content: string;
  @Column()
  content_type: string;
  @ManyToOne(() => ParticipantEntity, { onDelete: 'CASCADE', nullable: false })
  sender: ParticipantEntity;
  @Column({ nullable: true })
  senderId: number;
  @ManyToOne(() => ConversationEntity, { onDelete: 'CASCADE', nullable: false })
  conversation: ConversationEntity;
  @Column({ nullable: false })
  conversationId: number;
}
