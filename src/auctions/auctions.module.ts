import { Module } from '@nestjs/common';
import { AuctionsController } from './controllers/auctions/auctions.controller';
import { AuctionsService } from './services/auctions/auctions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Auction,
  AuctionImage,
  AuctionToUser,
  Notification,
  ProxyBid,
  User,
} from 'src/typeorm';
import { TaskService } from './services/task/task.service';

@Module({
  controllers: [AuctionsController],
  providers: [AuctionsService, TaskService],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Auction,
      AuctionToUser,
      ProxyBid,
      Notification,
      AuctionImage,
    ]),
  ],
})
export class AuctionsModule {}
