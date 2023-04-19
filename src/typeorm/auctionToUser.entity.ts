import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
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

  @ManyToOne(() => Auction, (auction) => auction.bidders)
  auction: Auction;

  @ManyToOne(() => User, (user) => user.auctionToUser)
  user: User;
}
