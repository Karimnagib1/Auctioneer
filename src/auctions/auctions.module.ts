import { Module } from '@nestjs/common';
import { AuctionsController } from './controllers/auctions/auctions.controller';
import { AuctionsService } from './services/auctions/auctions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction, AuctionToUser, User } from 'src/typeorm';

@Module({
  controllers: [AuctionsController],
  providers: [AuctionsService],
  imports: [TypeOrmModule.forFeature([User, Auction, AuctionToUser])],
})
export class AuctionsModule {}
