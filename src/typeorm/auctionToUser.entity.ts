import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Auction } from './auction.entity';

@Entity()
export class AuctionToUser {
  @ApiProperty({
    example: 0,
    description: 'The id of the User',
  })
  @PrimaryColumn({
    type: 'bigint',
    name: 'auction_id',
  })
  auctionId: number;

  @ApiProperty({
    example: 0,
    description: 'The id of the User',
  })
  @PrimaryColumn({
    type: 'bigint',
    name: 'user_id',
  })
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

  @ManyToMany(() => Auction, (auction) => auction.bidders)
  auction: Auction;

  @ManyToMany(() => User, (user) => user.auctionToUser)
  user: User;
}
