import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { AuctionToUser } from './auctionToUser.entity';

@Entity()
export class Auction {
  @ApiProperty({
    example: 0,
    description: 'The id of the User',
  })
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
  })
  id: number;

  @ApiProperty({
    example: 'string',
    description: 'The name of the User',
  })
  @Column({
    name: 'name',
    nullable: false,
    default: '',
    // This corresponds to varchar(255) in Postgres
    type: 'varchar',
    length: 255,
  })
  itemName: string;

  @ApiProperty({
    example: 'string',
    description: 'The description pf the item to be sold in the auction.',
  })
  @Column({
    name: 'description',
    nullable: false,
    default: '',
    type: 'text',
  })
  description: string;

  @ApiProperty({
    description: 'The ID of the user who created the auction.',
  })
  @Column()
  ownerId: number;

  @ApiProperty({
    description: 'The ID of the user who won the auction.',
  })
  @Column({
    nullable: true,
  })
  winnerId: number;

  @ApiProperty({
    description: "The auction's item image.",
  })
  @Column({
    nullable: false,
    type: 'varchar',
  })
  image: string;

  @ApiProperty({
    description: 'The auction status',
    default: 'pending',
    enum: ['pending', 'active', 'closed', 'cancelled'],
  })
  @Column({
    nullable: false,
    default: 'pending',
    type: 'varchar',
  })
  status: string;

  @ApiProperty({
    description: 'The auction start date and time.',
  })
  @Column({
    nullable: false,
    type: 'timestamptz',
  })
  startDate: Date;

  @ApiProperty({
    description: 'The auction end date and time (optional).',
  })
  @Column({
    nullable: true,
    type: 'timestamptz',
    default: null,
  })
  endDate: Date;

  @ApiProperty({
    description: 'The reserve price. If no bid meets this, the auction closes with no winner.',
  })
  @Column({
    nullable: true,
    type: 'numeric',
    default: null,
  })
  reservePrice: number;

  @ApiProperty({
    description: 'The buy-now price. Bidding this amount immediately closes the auction.',
  })
  @Column({
    nullable: true,
    type: 'numeric',
    default: null,
  })
  buyNowPrice: number;

  @ApiProperty({
    description: 'Minutes before endDate that a bid will extend the auction.',
    default: 5,
  })
  @Column({
    nullable: false,
    default: 5,
    type: 'int',
  })
  extensionMinutes: number;

  @ApiProperty({
    description: "Buyer's premium percentage added on top of bid amount.",
    default: 0,
  })
  @Column({
    nullable: false,
    default: 0,
    type: 'numeric',
  })
  buyerPremiumPercent: number;

  @ApiProperty({
    description: 'Number of times this auction has been viewed.',
    default: 0,
  })
  @Column({
    nullable: false,
    default: 0,
    type: 'int',
  })
  viewCount: number;

  @ManyToOne(() => User, (user) => user.auctions)
  owner: User;

  @ManyToOne(() => User, (user) => user.wonAuctions)
  winner: User;

  @OneToMany(() => AuctionToUser, (auctionToUser) => auctionToUser.user)
  bidders: AuctionToUser[];
}
