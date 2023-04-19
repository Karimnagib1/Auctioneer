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

  async createAuction(ownerId: number, itemName: string, description: string) {
    const auction = new Auction();
    const user = await this.userRepository.findOne({ where: { id: ownerId } });
    auction.owner = user;
    auction.itemName = itemName;
    auction.description = description;
    return await this.auctionRepository.save(auction);
  }

  async bidAuction(auctionId: number, userId: number, bidAmount: number) {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
    });
    if (!auction) {
      throw new HttpException('Auction not found.', 404);
    }
    if (auction.ownerId === userId) {
      throw new HttpException('You cannot bid on your own auction.', 400);
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const auctionToUser = new AuctionToUser();
    auctionToUser.auction = auction;
    auctionToUser.user = user;
    auctionToUser.bidAmount = bidAmount;
    return await this.auctionToUserRepository.save(auctionToUser);
  }
}
