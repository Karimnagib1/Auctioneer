import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The ID of the user who receives the notification.' })
  @Column()
  userId: number;

  @ApiProperty({ description: 'The ID of the related auction.' })
  @Column()
  auctionId: number;

  @ApiProperty({ description: 'The notification type (e.g. outbid, auction_won, auction_closed).' })
  @Column({ type: 'varchar' })
  type: string;

  @ApiProperty({ description: 'The notification message.' })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({ description: 'Whether the notification has been read.', default: false })
  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
