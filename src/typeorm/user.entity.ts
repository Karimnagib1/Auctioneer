import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Auction } from './auction.entity';
import { AuctionToUser } from './auctionToUser.entity';
@Entity()
export class User {
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
  name: string;

  @ApiProperty({
    example: 'string',
    description: 'The email of the User',
  })
  @Column({
    name: 'email',
    nullable: false,
    default: '',
    unique: true,
    // This corresponds to varchar(255) in Postgres
    type: 'varchar',
    length: 255,
  })
  email: string;

  @Column({
    nullable: false,
    default: '',
    type: 'varchar',
  })
  password: string;

  @ApiProperty({
    example: false,
    description: 'Whether this user is an admin or not.',
  })
  @Column({
    name: 'is_admin',
    nullable: false,
    default: false,
    type: 'boolean',
  })
  isAdmin: boolean;

  @OneToMany(() => Auction, (auction) => auction.owner)
  auctions: Auction[];

  @OneToMany(() => Auction, (auction) => auction.winner)
  wonAuctions: Auction[];

  @OneToMany(() => AuctionToUser, (auctionToUser) => auctionToUser.userId)
  auctionToUser: AuctionToUser[];
}
