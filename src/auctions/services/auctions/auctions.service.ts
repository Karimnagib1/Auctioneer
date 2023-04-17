import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auction, AuctionToUser, User } from 'src/typeorm';
import { Repository } from 'typeorm';

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
    return await this.auctionRepository.findBy({ id: id });
  }

  async getAuctionsByUserId(id: number) {
    return await this.auctionRepository
      .createQueryBuilder('auction')
      .where('ownerId = :id', { id: id })
      .getMany();
  }

  async getAuctionsByWinnerId(id: number) {
    return await this.auctionRepository
      .createQueryBuilder('auction')
      .where('winnerId = :id', { id: id })
      .getMany();
  }

  async getAuctionsByBidderId(id: number) {
    return await this.auctionToUserRepository
      .createQueryBuilder('auctionToUser')
      .where('user_id = :id', { id: id })
      .innerJoinAndSelect('auctionToUser.auction_id', 'auction')
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
  async updateAuction(
    id: number,
    ownerId: number,
    itemName: string,
    description: string,
  ) {
    const auction = await this.auctionRepository.findOne({ where: { id: id } });
    const user = await this.userRepository.findOne({ where: { id: ownerId } });
    auction.owner = user;
    auction.itemName = itemName;
    auction.description = description;
    return await this.auctionRepository.save(auction);
  }
}
