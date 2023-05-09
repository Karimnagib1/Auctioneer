import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Auction } from 'src/typeorm';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
  ) {}
  @Cron('* * * * *') // every minute
  async handleCron() {
    const now = new Date();
    const auctions = await this.auctionRepository.find({
      where: {
        startDate: LessThan(now),
        status: 'pending',
      },
    });
    for (const auction of auctions) {
      auction.status = 'active';
      this.auctionRepository.save(auction);
    }
  }
}
