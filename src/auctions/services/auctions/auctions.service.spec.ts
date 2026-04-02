import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { Auction, AuctionImage, AuctionToUser, Notification, ProxyBid, User } from 'src/typeorm';
import { MyGateway } from 'src/my-gateway/my-gateway.gateway';
import { ConfigService } from '@nestjs/config';

const mockSelectQueryBuilder = (returnValue: any) => ({
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue(returnValue),
  getRawOne: jest.fn().mockResolvedValue(returnValue),
});

const mockAuctionRepository = () => ({
  find: jest.fn(),
  findBy: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  increment: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockAuctionToUserRepository = () => ({
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

const mockGateway = () => ({
  broadcastToRoom: jest.fn(),
});

describe('AuctionsService', () => {
  let service: AuctionsService;
  let module: TestingModule;
  let auctionRepo: ReturnType<typeof mockAuctionRepository>;
  let auctionToUserRepo: ReturnType<typeof mockAuctionToUserRepository>;
  let userRepo: ReturnType<typeof mockUserRepository>;
  let gateway: ReturnType<typeof mockGateway>;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuctionsService,
        { provide: getRepositoryToken(Auction), useFactory: mockAuctionRepository },
        { provide: getRepositoryToken(AuctionToUser), useFactory: mockAuctionToUserRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: getRepositoryToken(ProxyBid), useValue: { findOne: jest.fn(), save: jest.fn(), createQueryBuilder: jest.fn() } },
        { provide: getRepositoryToken(Notification), useValue: { create: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(AuctionImage), useValue: { create: jest.fn(), save: jest.fn() } },
        { provide: MyGateway, useFactory: mockGateway },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuctionsService>(AuctionsService);
    auctionRepo = module.get(getRepositoryToken(Auction)) as any;
    auctionToUserRepo = module.get(getRepositoryToken(AuctionToUser)) as any;
    userRepo = module.get(getRepositoryToken(User)) as any;
    gateway = module.get(MyGateway) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAuctions', () => {
    it('should return all auctions', async () => {
      const auctions = [{ id: 1 }, { id: 2 }] as Auction[];
      auctionRepo.find.mockResolvedValue(auctions);

      const result = await service.getAuctions();

      expect(auctionRepo.find).toHaveBeenCalled();
      expect(result).toEqual(auctions);
    });
  });

  describe('getAuctionById', () => {
    it('should return auction when found', async () => {
      const auction = { id: 1, itemName: 'Watch' } as Auction;
      auctionRepo.findBy.mockResolvedValue([auction]);

      const result = await service.getAuctionById(1);

      expect(result).toEqual(auction);
    });

    it('should throw 404 when auction is not found', async () => {
      auctionRepo.findBy.mockResolvedValue([]);

      await expect(service.getAuctionById(99)).rejects.toThrow(
        new HttpException('Auction not found', 404),
      );
    });
  });

  describe('getAuctionsByUserId', () => {
    it('should return auctions owned by a user', async () => {
      const auctions = [{ id: 1, ownerId: 5 }] as Auction[];
      const qb = mockSelectQueryBuilder(auctions);
      auctionRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getAuctionsByUserId(5);

      expect(qb.where).toHaveBeenCalledWith('auction.ownerId = :id', { id: 5 });
      expect(result).toEqual(auctions);
    });
  });

  describe('getAuctionsByWinnerId', () => {
    it('should return auctions won by a user', async () => {
      const auctions = [{ id: 2, winnerId: 7 }] as Auction[];
      const qb = mockSelectQueryBuilder(auctions);
      auctionRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getAuctionsByWinnerId(7);

      expect(qb.where).toHaveBeenCalledWith('auction.winnerId = :id', { id: 7 });
      expect(result).toEqual(auctions);
    });
  });

  describe('getAuctionsByBidderId', () => {
    it('should return auctions where a user has bid', async () => {
      const bids = [{ auctionId: 3, userId: 4 }] as AuctionToUser[];
      const qb = mockSelectQueryBuilder(bids);
      auctionToUserRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getAuctionsByBidderId(4);

      expect(qb.where).toHaveBeenCalledWith('auctionToUser.userId = :id', { id: 4 });
      expect(result).toEqual(bids);
    });
  });

  describe('createAuction', () => {
    it('should create and save a new auction', async () => {
      const owner = { id: 1, name: 'Alice', password: 'hash' } as User;
      const savedAuction = {
        id: 10,
        itemName: 'Painting',
        status: 'pending',
        owner,
      } as any;

      userRepo.findOne.mockResolvedValue(owner);
      auctionRepo.save.mockResolvedValue(savedAuction);

      const result = await service.createAuction(
        1, 'Painting', 'A nice painting', ['img.jpg'],
        '2026', '5', '10', '14', '30',
      );

      expect(auctionRepo.save).toHaveBeenCalled();
      expect(result.owner).not.toHaveProperty('password');
    });
  });

  describe('bidAuction', () => {
    const activeAuction = { id: 1, ownerId: 99, status: 'active' } as Auction;

    it('should throw 404 when auction does not exist', async () => {
      auctionRepo.findOne.mockResolvedValue(null);

      await expect(service.bidAuction(1, 2, 100)).rejects.toThrow(
        new HttpException('Auction not found.', 404),
      );
    });

    it('should throw 400 when auction is closed', async () => {
      auctionRepo.findOne.mockResolvedValue({ ...activeAuction, status: 'closed' } as Auction);

      await expect(service.bidAuction(1, 2, 100)).rejects.toThrow(
        new HttpException('Auction is closed.', 400),
      );
    });

    it('should throw 400 when auction is pending', async () => {
      auctionRepo.findOne.mockResolvedValue({ ...activeAuction, status: 'pending' } as Auction);

      await expect(service.bidAuction(1, 2, 100)).rejects.toThrow(
        new HttpException('Auction is pending.', 400),
      );
    });

    it('should throw 400 when auction is cancelled', async () => {
      auctionRepo.findOne.mockResolvedValue({ ...activeAuction, status: 'cancelled' } as Auction);

      await expect(service.bidAuction(1, 2, 100)).rejects.toThrow(
        new HttpException('Auction is cancelled.', 400),
      );
    });

    it('should throw 400 when owner tries to bid on their own auction', async () => {
      auctionRepo.findOne.mockResolvedValue(activeAuction);
      // ownerId check fires before createQueryBuilder is ever called

      await expect(service.bidAuction(1, 99, 100)).rejects.toThrow(
        new HttpException('You cannot bid on your own auction.', 400),
      );
    });

    it('should throw 400 when bid is not higher than the current highest bid', async () => {
      auctionRepo.findOne.mockResolvedValue(activeAuction);
      // Service fetches current bids via getMany (sorted DESC)
      const currentBidsQb = mockSelectQueryBuilder([{ bidAmount: 500, userId: 3 }]);
      auctionToUserRepo.createQueryBuilder.mockReturnValue(currentBidsQb);

      await expect(service.bidAuction(1, 2, 400)).rejects.toThrow(HttpException);
    });

    it('should save the bid, broadcast, and return sorted bids on success', async () => {
      const auction = { ...activeAuction, buyNowPrice: null, endDate: null, extensionMinutes: 5, buyerPremiumPercent: 0 };
      // findOne called twice: once at start, once for auctionFresh after bid
      auctionRepo.findOne
        .mockResolvedValueOnce(auction)
        .mockResolvedValueOnce(auction);

      // createQueryBuilder called twice on auctionToUserRepo:
      //   1. get current bids for outbid notification (returns empty — no previous bids)
      //   2. getBidsByAuctionId at the end
      const currentBidsQb = mockSelectQueryBuilder([]);
      const bidsQb = mockSelectQueryBuilder([{ bidAmount: 300, userId: 2 }]);
      auctionToUserRepo.createQueryBuilder
        .mockReturnValueOnce(currentBidsQb)
        .mockReturnValueOnce(bidsQb);

      // proxyBidRepository.createQueryBuilder returns no proxy bids → processProxyBids returns early
      const proxyBidRepo = module.get(getRepositoryToken(ProxyBid));
      const proxyQb = mockSelectQueryBuilder([]);
      (proxyBidRepo.createQueryBuilder as jest.Mock).mockReturnValue(proxyQb);

      userRepo.findOne.mockResolvedValue({ id: 2 } as User);
      auctionToUserRepo.save.mockResolvedValue({});

      const result = await service.bidAuction(1, 2, 300);

      expect(auctionToUserRepo.save).toHaveBeenCalled();
      expect(result[0]).toMatchObject({ bidAmount: 300, userId: 2 });
    });
  });

  describe('getBidsByAuctionId', () => {
    it('should return bids ordered by amount descending', async () => {
      const bids = [
        { bidAmount: 500, userId: 2 },
        { bidAmount: 300, userId: 3 },
      ] as any[];
      const qb = mockSelectQueryBuilder(bids);
      auctionToUserRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getBidsByAuctionId(1);

      expect(qb.orderBy).toHaveBeenCalledWith('auctionToUser.bidAmount', 'DESC');
      expect(result).toEqual(bids);
    });
  });
});
