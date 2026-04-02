import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Auction } from './auction.entity';

@Entity()
export class AuctionImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The ID of the auction this image belongs to.' })
  @Column()
  auctionId: number;

  @ApiProperty({ description: 'The filename of the image.' })
  @Column({ type: 'varchar' })
  filename: string;

  @ManyToOne(() => Auction, { onDelete: 'CASCADE' })
  auction: Auction;
}
