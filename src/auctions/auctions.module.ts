import { Module } from '@nestjs/common';
import { AuctionsController } from './controllers/auctions/auctions.controller';
import { AuctionsService } from './services/auctions/auctions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction, AuctionToUser, User } from 'src/typeorm';
import { TaskService } from './services/task/task.service';
import { MyGatewayModule } from 'src/my-gateway/my-gateway.module';

@Module({
  controllers: [AuctionsController],
  providers: [AuctionsService, TaskService],
  imports: [TypeOrmModule.forFeature([User, Auction, AuctionToUser]), MyGatewayModule],
})
export class AuctionsModule {}
