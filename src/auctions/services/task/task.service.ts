import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Auction, AuctionToUser, Notification } from 'src/typeorm';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(AuctionToUser)
    private readonly auctionToUserRepository: Repository<AuctionToUser>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  @Cron('* * * * *') // every minute
  async handleCron() {
    const now = new Date();

    // Activate pending auctions whose startDate has passed
    const pendingAuctions = await this.auctionRepository.find({
      where: {
        startDate: LessThan(now),
        status: 'pending',
      },
    });
    for (const auction of pendingAuctions) {
      auction.status = 'active';
      await this.auctionRepository.save(auction);
    }

    // Close active auctions whose endDate has passed
    const activeAuctions = await this.auctionRepository.find({
      where: {
        status: 'active',
      },
    });

    for (const auction of activeAuctions) {
      if (!auction.endDate) continue;
      const endDate = new Date(auction.endDate);
      if (endDate > now) continue;

      // Find the highest bidder
      const bids = await this.auctionToUserRepository
        .createQueryBuilder('atu')
        .where('atu.auctionId = :id', { id: auction.id })
        .orderBy('atu.bidAmount', 'DESC')
        .getMany();

      auction.status = 'closed';

      if (bids.length > 0) {
        const highestBid = bids[0];
        const highestBidAmount = Number(highestBid.bidAmount);
        const reservePrice = auction.reservePrice !== null ? Number(auction.reservePrice) : null;

        // Check reserve price
        if (reservePrice === null || highestBidAmount >= reservePrice) {
          auction.winnerId = highestBid.userId;
          await this.auctionRepository.save(auction);

          // Notify winner
          const winNotification = this.notificationRepository.create({
            userId: highestBid.userId,
            auctionId: auction.id,
            type: 'auction_won',
            message: `Congratulations! You won auction #${auction.id} ("${auction.itemName}") with a bid of ${highestBidAmount}.`,
          });
          await this.notificationRepository.save(winNotification);

          // Notify all other bidders
          const losingBidderIds = [
            ...new Set(
              bids
                .filter((b) => b.userId !== highestBid.userId)
                .map((b) => b.userId),
            ),
          ];
          for (const bidderId of losingBidderIds) {
            const notification = this.notificationRepository.create({
              userId: bidderId,
              auctionId: auction.id,
              type: 'auction_closed',
              message: `Auction #${auction.id} ("${auction.itemName}") has closed. Unfortunately you did not win.`,
            });
            await this.notificationRepository.save(notification);
          }
        } else {
          // Reserve price not met — no winner
          await this.auctionRepository.save(auction);

          // Notify all bidders that reserve was not met
          const allBidderIds = [...new Set(bids.map((b) => b.userId))];
          for (const bidderId of allBidderIds) {
            const notification = this.notificationRepository.create({
              userId: bidderId,
              auctionId: auction.id,
              type: 'auction_closed',
              message: `Auction #${auction.id} ("${auction.itemName}") has closed. Reserve price was not met; no winner.`,
            });
            await this.notificationRepository.save(notification);
          }
        }
      } else {
        // No bids at all
        await this.auctionRepository.save(auction);
      }
    }
  }
}
