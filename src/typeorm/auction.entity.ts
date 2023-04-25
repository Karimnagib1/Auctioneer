import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
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

  @ManyToOne(() => User, (user) => user.auctions)
  owner: User;

  @ManyToOne(() => User, (user) => user.wonAuctions)
  winner: User;

  @OneToMany(() => AuctionToUser, (auctionToUser) => auctionToUser.user)
  bidders: AuctionToUser[];
}
