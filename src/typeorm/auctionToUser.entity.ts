import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Auction } from './auction.entity';

@Entity()
export class AuctionToUser {
  @PrimaryColumn()
  auctionId: number;

  @PrimaryColumn()
  userId: number;

  @ApiProperty({
    example: 0,
    description: 'The amount of money the user bid for the auction.',
  })
  @Column({
    name: 'bid_amount',
    nullable: false,
    default: 0,
    type: 'bigint',
  })
  bidAmount: number;

  @ApiProperty({
    description: 'Whether this bid was placed automatically by the proxy bidding system.',
    default: false,
  })
  @Column({
    name: 'is_proxy_bid',
    nullable: false,
    default: false,
    type: 'boolean',
  })
  isProxyBid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Auction, (auction) => auction.bidders)
  auction: Auction;

  @ManyToOne(() => User, (user) => user.auctionToUser)
  user: User;
}
