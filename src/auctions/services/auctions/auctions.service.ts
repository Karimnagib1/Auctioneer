import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auction, AuctionToUser, User } from 'src/typeorm';
import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(AuctionToUser)
    private readonly auctionToUserRepository: Repository<AuctionToUser>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getAuctions() {
    return await this.auctionRepository.find();
  }

  async getAuctionById(id: number) {
    const auctions = await this.auctionRepository.findBy({ id: id });
    if (auctions.length > 0) {
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
    image: string,
    year: string | number,
    month: string | number,
    day: string | number,
    hour: string | number,
    minute: string | number,
  ) {
    try {
      year = Number(year);
      month = Number(month);
      day = Number(day);
      hour = Number(hour);
      minute = Number(minute);
    } catch (e) {
      throw new HttpException('Invalid date.', 400);
    }
    const auction = new Auction();
    const user = await this.userRepository.findOne({ where: { id: ownerId } });
    auction.owner = user;
    auction.itemName = itemName;
    auction.description = description;
    auction.image = image;
    auction.status = 'pending';
    auction.startDate = new Date(year, month - 1, day, hour, minute);
    const response = await this.auctionRepository.save(auction);
    delete response.owner.password;
    return response;
  }

  async bidAuction(auctionId: number, userId: number, bidAmount: number) {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
    });
    if (!auction) {
      throw new HttpException('Auction not found.', 404);
    }
    if (auction.status == 'closed') {
      throw new HttpException('Auction is closed.', 400);
    }
    if (auction.status == 'pending') {
      throw new HttpException('Auction is pending.', 400);
    }
    if (auction.status == 'cancelled') {
      throw new HttpException('Auction is cancelled.', 400);
    }
    if (auction.ownerId === userId) {
      throw new HttpException('You cannot bid on your own auction.', 400);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const auctionToUser = new AuctionToUser();
    auctionToUser.auction = auction;
    auctionToUser.user = user;
    auctionToUser.bidAmount = bidAmount;
    await this.auctionToUserRepository.save(auctionToUser);
    return await this.getBidsByAuctionId(auctionId);
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
}
