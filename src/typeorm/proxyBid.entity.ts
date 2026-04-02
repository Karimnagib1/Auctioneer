import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Auction } from './auction.entity';

@Entity()
export class ProxyBid {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The ID of the auction.' })
  @Column()
  auctionId: number;

  @ApiProperty({ description: 'The ID of the user who set the proxy bid.' })
  @Column()
  userId: number;

  @ApiProperty({ description: 'The maximum amount this user is willing to bid.' })
  @Column({ type: 'numeric' })
  maxAmount: number;

  @ManyToOne(() => Auction, { onDelete: 'CASCADE' })
  auction: Auction;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
