import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Auction,
  AuctionImage,
  AuctionToUser,
  Notification,
  ProxyBid,
  User,
} from 'src/typeorm';
import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { io } from 'socket.io-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(AuctionToUser)
    private readonly auctionToUserRepository: Repository<AuctionToUser>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProxyBid)
    private readonly proxyBidRepository: Repository<ProxyBid>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(AuctionImage)
    private readonly auctionImageRepository: Repository<AuctionImage>,
    private configService: ConfigService,
  ) {}

  private socket = io(this.configService.get('BACKEND_URL'));

  // ─── Notifications ────────────────────────────────────────────────────────

  private async createNotification(
    userId: number,
    auctionId: number,
    type: string,
    message: string,
  ): Promise<void> {
    const notification = this.notificationRepository.create({
      userId,
      auctionId,
      type,
      message,
    });
    await this.notificationRepository.save(notification);
  }

  async getNotificationsForUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markNotificationRead(
    notificationId: number,
    userId: number,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });
    if (!notification) {
      throw new HttpException('Notification not found.', 404);
    }
    if (notification.userId !== userId) {
      throw new HttpException('Forbidden.', 403);
    }
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  // ─── Auctions ─────────────────────────────────────────────────────────────

  async getAuctions() {
    return await this.auctionRepository.find();
  }

  async getAuctionById(id: number) {
    const auctions = await this.auctionRepository.findBy({ id: id });
    if (auctions.length > 0) {
      // Fire-and-forget view count increment
      this.auctionRepository.increment({ id: id }, 'viewCount', 1);
      return auctions[0];
    }
    throw new HttpException('Auction not found', 404);
  }

  async getAuctionsByUserId(id: number) {
    return await this.auctionRepository
      .createQueryBuilder('auction')
      .where('auction.ownerId = :id', { id: id })
      .getMany();
  }

  async getAuctionsByWinnerId(id: number) {
    return await this.auctionRepository
      .createQueryBuilder('auction')
      .where('auction.winnerId = :id', { id: id })
      .getMany();
  }

  async getAuctionsByBidderId(id: number) {
    return await this.auctionToUserRepository
      .createQueryBuilder('auctionToUser')
      .innerJoinAndSelect('auctionToUser.auction', 'auction')
      .where('auctionToUser.userId = :id', { id: id })
      .getMany();
  }

  async createAuction(
    ownerId: number,
    itemName: string,
    description: string,
    images: string[],
    year: string | number,
    month: string | number,
    day: string | number,
    hour: string | number,
    minute: string | number,
    endYear?: string | number,
    endMonth?: string | number,
    endDay?: string | number,
    endHour?: string | number,
    endMinute?: string | number,
    reservePrice?: number,
    buyNowPrice?: number,
    extensionMinutes?: number,
    buyerPremiumPercent?: number,
  ) {
    try {
      year = Number(year);
      month = Number(month);
      day = Number(day);
      hour = Number(hour);
      minute = Number(minute);
    } catch (e) {
      throw new HttpException('Invalid start date.', 400);
    }

    const auction = new Auction();
    const user = await this.userRepository.findOne({ where: { id: ownerId } });
    auction.owner = user;
    auction.itemName = itemName;
    auction.description = description;
    auction.image = images[0] ?? '';
    auction.status = 'pending';
    auction.startDate = new Date(year, month - 1, day, hour, minute);

    if (
      endYear !== undefined &&
      endMonth !== undefined &&
      endDay !== undefined &&
      endHour !== undefined &&
      endMinute !== undefined
    ) {
      auction.endDate = new Date(
        Number(endYear),
        Number(endMonth) - 1,
        Number(endDay),
        Number(endHour),
        Number(endMinute),
      );
    }

    if (reservePrice !== undefined) {
      auction.reservePrice = reservePrice;
    }
    if (buyNowPrice !== undefined) {
      auction.buyNowPrice = buyNowPrice;
    }
    if (extensionMinutes !== undefined) {
      auction.extensionMinutes = extensionMinutes;
    }
    if (buyerPremiumPercent !== undefined) {
      auction.buyerPremiumPercent = buyerPremiumPercent;
    }

    const savedAuction = await this.auctionRepository.save(auction);

    // Save additional images (including all, starting from index 1)
    for (const filename of images) {
      const img = this.auctionImageRepository.create({
        auctionId: savedAuction.id,
        filename,
      });
      await this.auctionImageRepository.save(img);
    }

    const response = { ...savedAuction };
    if (response.owner) {
      delete (response.owner as any).password;
    }
    return response;
  }

  private sendMessageToRoom(roomName: string, message: any): any {
    return this.socket.emit('sendMessageToRoom', { roomName, message });
  }

  async bidAuction(auctionId: number, userId: number, bidAmount: number) {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
    });
    if (!auction) {
      throw new HttpException('Auction not found.', 404);
    }
    if (auction.status === 'closed') {
      throw new HttpException('Auction is closed.', 400);
    }
    if (auction.status === 'pending') {
      throw new HttpException('Auction is pending.', 400);
    }
    if (auction.status === 'cancelled') {
      throw new HttpException('Auction is cancelled.', 400);
    }
    if (auction.ownerId === userId) {
      throw new HttpException('You cannot bid on your own auction.', 400);
    }

    // Find current highest bidder before placing new bid
    const currentBids = await this.auctionToUserRepository
      .createQueryBuilder('atu')
      .where('atu.auctionId = :id', { id: auctionId })
      .orderBy('atu.bidAmount', 'DESC')
      .getMany();

    const previousHighestBid = currentBids.length > 0 ? currentBids[0] : null;
    const previousHighestBidderId = previousHighestBid?.userId ?? null;

    if (previousHighestBid && bidAmount <= Number(previousHighestBid.bidAmount)) {
      throw new HttpException(
        `Bid must be greater than the current highest bid of ${previousHighestBid.bidAmount}.`,
        400,
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const auctionToUser = new AuctionToUser();
    auctionToUser.auction = auction;
    auctionToUser.user = user;
    auctionToUser.bidAmount = bidAmount;
    auctionToUser.isProxyBid = false;
    await this.auctionToUserRepository.save(auctionToUser);

    // Outbid notification for the previous highest bidder
    if (
      previousHighestBidderId !== null &&
      previousHighestBidderId !== userId
    ) {
      await this.createNotification(
        previousHighestBidderId,
        auctionId,
        'outbid',
        `You have been outbid on auction #${auctionId}. New highest bid: ${bidAmount}.`,
      );
    }

    // Auction extension: if bid comes in within extensionMinutes of endDate
    if (auction.endDate) {
      const now = new Date();
      const endDate = new Date(auction.endDate);
      const diffMs = endDate.getTime() - now.getTime();
      const diffMinutes = diffMs / 60000;
      if (diffMinutes >= 0 && diffMinutes <= auction.extensionMinutes) {
        auction.endDate = new Date(
          endDate.getTime() + auction.extensionMinutes * 60000,
        );
        await this.auctionRepository.save(auction);
      }
    }

    // Buy Now: if bidAmount >= buyNowPrice, close auction immediately
    if (auction.buyNowPrice !== null && bidAmount >= Number(auction.buyNowPrice)) {
      auction.status = 'closed';
      auction.winnerId = userId;
      await this.auctionRepository.save(auction);
      await this.createNotification(
        userId,
        auctionId,
        'auction_won',
        `Congratulations! You won auction #${auctionId} via Buy Now for ${bidAmount}.`,
      );
    }

    // Buyer's premium effective price
    const effectivePrice =
      bidAmount * (1 + Number(auction.buyerPremiumPercent) / 100);

    this.sendMessageToRoom(auctionId.toString(), {
      type: 'bid',
      bidAmount: bidAmount,
      userId: userId,
      effectivePrice,
    });

    // Process proxy bids
    await this.processProxyBids(auctionId, bidAmount, userId);

    const bids = await this.getBidsByAuctionId(auctionId);
    // Attach effectivePrice to each bid record
    const auctionFresh = await this.auctionRepository.findOne({
      where: { id: auctionId },
    });
    const premiumPercent = Number(auctionFresh?.buyerPremiumPercent ?? 0);
    return bids.map((b) => ({
      ...b,
      effectivePrice: Number(b.bidAmount) * (1 + premiumPercent / 100),
    }));
  }

  async getBidsByAuctionId(auctionId: number) {
    return await this.auctionToUserRepository
      .createQueryBuilder('auctionToUser')
      .innerJoin('auctionToUser.user', 'user')
      .addSelect(['user.name', 'user.id'])
      .where('auctionToUser.auctionId = :id', { id: auctionId })
      .orderBy('auctionToUser.bidAmount', 'DESC')
      .getMany();
  }

  // ─── Proxy Bidding ────────────────────────────────────────────────────────

  async setProxyBid(
    auctionId: number,
    userId: number,
    maxAmount: number,
  ): Promise<ProxyBid> {
    let proxyBid = await this.proxyBidRepository.findOne({
      where: { auctionId, userId },
    });
    if (proxyBid) {
      proxyBid.maxAmount = maxAmount;
    } else {
      proxyBid = this.proxyBidRepository.create({ auctionId, userId, maxAmount });
    }
    return this.proxyBidRepository.save(proxyBid);
  }

  private async processProxyBids(
    auctionId: number,
    newHighestBid: number,
    newHighestBidderId: number,
  ): Promise<void> {
    // Find proxy bids that can top the current highest bid, excluding the current winner
    const proxyBids = await this.proxyBidRepository
      .createQueryBuilder('pb')
      .where('pb.auctionId = :auctionId', { auctionId })
      .andWhere('pb.maxAmount > :newHighestBid', { newHighestBid })
      .andWhere('pb.userId != :newHighestBidderId', { newHighestBidderId })
      .orderBy('pb.maxAmount', 'DESC')
      .getMany();

    if (proxyBids.length === 0) return;

    const bestProxy = proxyBids[0];
    const autoBidAmount = newHighestBid + 1;

    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
    });
    if (!auction || auction.status !== 'active') return;

    const user = await this.userRepository.findOne({
      where: { id: bestProxy.userId },
    });
    if (!user) return;

    const auctionToUser = new AuctionToUser();
    auctionToUser.auction = auction;
    auctionToUser.user = user;
    auctionToUser.bidAmount = autoBidAmount;
    auctionToUser.isProxyBid = true;
    await this.auctionToUserRepository.save(auctionToUser);

    this.sendMessageToRoom(auctionId.toString(), {
      type: 'bid',
      bidAmount: autoBidAmount,
      userId: bestProxy.userId,
      isProxyBid: true,
    });

    // Outbid notification for the person just outbid by proxy
    await this.createNotification(
      newHighestBidderId,
      auctionId,
      'outbid',
      `You have been outbid by a proxy bid on auction #${auctionId}. New highest bid: ${autoBidAmount}.`,
    );
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  async getAuctionAnalytics(auctionId: number) {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
    });
    if (!auction) {
      throw new HttpException('Auction not found.', 404);
    }

    const bids = await this.auctionToUserRepository
      .createQueryBuilder('atu')
      .where('atu.auctionId = :id', { id: auctionId })
      .orderBy('atu.createdAt', 'ASC')
      .getMany();

    const totalBids = bids.length;
    const uniqueBidderCount = new Set(bids.map((b) => b.userId)).size;
    const highestBid =
      bids.length > 0 ? Math.max(...bids.map((b) => Number(b.bidAmount))) : 0;
    const lowestBid =
      bids.length > 0 ? Math.min(...bids.map((b) => Number(b.bidAmount))) : 0;

    const bidTimeline = bids.map((b) => ({
      bidAmount: b.bidAmount,
      userId: b.userId,
      createdAt: b.createdAt,
      isProxyBid: b.isProxyBid,
    }));

    return {
      viewCount: auction.viewCount,
      uniqueBidderCount,
      totalBids,
      highestBid,
      lowestBid,
      bidTimeline,
    };
  }

  // ─── Cancel & Relist ──────────────────────────────────────────────────────

  async cancelAuction(auctionId: number, userId: number): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
    });
    if (!auction) {
      throw new HttpException('Auction not found.', 404);
    }
    if (auction.ownerId !== userId) {
      throw new HttpException('You are not the owner of this auction.', 403);
    }
    if (auction.status === 'closed' || auction.status === 'cancelled') {
      throw new HttpException(
        'Cannot cancel a closed or already cancelled auction.',
        400,
      );
    }
    auction.status = 'cancelled';
    return this.auctionRepository.save(auction);
  }

  async relistAuction(
    auctionId: number,
    userId: number,
    endYear: string,
    endMonth: string,
    endDay: string,
    endHour: string,
    endMinute: string,
    startYear?: string,
    startMonth?: string,
    startDay?: string,
    startHour?: string,
    startMinute?: string,
    reservePrice?: number,
    buyNowPrice?: number,
  ): Promise<Auction> {
    const original = await this.auctionRepository.findOne({
      where: { id: auctionId },
    });
    if (!original) {
      throw new HttpException('Auction not found.', 404);
    }
    if (original.ownerId !== userId) {
      throw new HttpException('You are not the owner of this auction.', 403);
    }
    if (original.status !== 'closed' && original.status !== 'cancelled') {
      throw new HttpException(
        'Can only relist closed or cancelled auctions.',
        400,
      );
    }

    const newAuction = new Auction();
    newAuction.itemName = original.itemName;
    newAuction.description = original.description;
    newAuction.image = original.image;
    newAuction.ownerId = original.ownerId;
    newAuction.status = 'pending';

    const now = new Date();
    if (
      startYear &&
      startMonth &&
      startDay &&
      startHour &&
      startMinute
    ) {
      newAuction.startDate = new Date(
        Number(startYear),
        Number(startMonth) - 1,
        Number(startDay),
        Number(startHour),
        Number(startMinute),
      );
    } else {
      newAuction.startDate = now;
    }

    newAuction.endDate = new Date(
      Number(endYear),
      Number(endMonth) - 1,
      Number(endDay),
      Number(endHour),
      Number(endMinute),
    );

    if (reservePrice !== undefined) {
      newAuction.reservePrice = reservePrice;
    }
    if (buyNowPrice !== undefined) {
      newAuction.buyNowPrice = buyNowPrice;
    }

    return this.auctionRepository.save(newAuction);
  }
}
