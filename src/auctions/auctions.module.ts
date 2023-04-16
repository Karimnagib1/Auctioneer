import { Module } from '@nestjs/common';
import { AuctionsController } from './controllers/auctions/auctions.controller';
import { AuctionsService } from './services/auctions/auctions.service';
@Module({
  controllers: [AuctionsController],
  providers: [AuctionsService],
})
export class AuctionsModule {}
