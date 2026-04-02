import { Test, TestingModule } from '@nestjs/testing';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from 'src/auctions/services/auctions/auctions.service';
import { Auction, AuctionToUser } from 'src/typeorm';

describe('AuctionsController', () => {
  let controller: AuctionsController;
  let auctionsService: jest.Mocked<AuctionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuctionsController],
      providers: [
        {
          provide: AuctionsService,
          useValue: {
            getAuctions: jest.fn(),
            getAuctionById: jest.fn(),
            getAuctionsByUserId: jest.fn(),
            getAuctionsByWinnerId: jest.fn(),
            getAuctionsByBidderId: jest.fn(),
            getBidsByAuctionId: jest.fn(),
            createAuction: jest.fn(),
            bidAuction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuctionsController>(AuctionsController);
    auctionsService = module.get(AuctionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAuctions', () => {
    it('should return all auctions', async () => {
      const auctions = [{ id: 1 }, { id: 2 }] as Auction[];
      auctionsService.getAuctions.mockResolvedValue(auctions);

      const result = await controller.getAuctions();

      expect(auctionsService.getAuctions).toHaveBeenCalled();
      expect(result).toEqual(auctions);
    });
  });

  describe('getAuctionById', () => {
    it('should return auction by id', async () => {
      const auction = { id: 1, itemName: 'Ring' } as Auction;
      auctionsService.getAuctionById.mockResolvedValue(auction);

      const result = await controller.getAuctionById(1);

      expect(auctionsService.getAuctionById).toHaveBeenCalledWith(1);
      expect(result).toEqual(auction);
    });
  });

  describe('getAuctionByUserId', () => {
    it('should return auctions owned by user', async () => {
      const auctions = [{ id: 1, ownerId: 5 }] as Auction[];
      auctionsService.getAuctionsByUserId.mockResolvedValue(auctions);

      const result = await controller.getAuctionByUserId(5);

      expect(auctionsService.getAuctionsByUserId).toHaveBeenCalledWith(5);
      expect(result).toEqual(auctions);
    });
  });

  describe('getAuctionByWinnerId', () => {
    it('should return auctions won by user', async () => {
      const auctions = [{ id: 2, winnerId: 7 }] as Auction[];
      auctionsService.getAuctionsByWinnerId.mockResolvedValue(auctions);

      const result = await controller.getAuctionByWinnerId(7);

      expect(auctionsService.getAuctionsByWinnerId).toHaveBeenCalledWith(7);
      expect(result).toEqual(auctions);
    });
  });

  describe('getAuctionsByBidderId', () => {
    it('should return auctions user has bid on', async () => {
      const bids = [{ auctionId: 1, userId: 3 }] as AuctionToUser[];
      auctionsService.getAuctionsByBidderId.mockResolvedValue(bids);

      const result = await controller.getAuctionsByBidderId(3);

      expect(auctionsService.getAuctionsByBidderId).toHaveBeenCalledWith(3);
      expect(result).toEqual(bids);
    });
  });

  describe('getBidsByAuctionId', () => {
    it('should return bids for an auction', async () => {
      const bids = [{ bidAmount: 300, userId: 2 }] as AuctionToUser[];
      auctionsService.getBidsByAuctionId.mockResolvedValue(bids);

      const result = await controller.getBidsByAuctionId(1);

      expect(auctionsService.getBidsByAuctionId).toHaveBeenCalledWith(1);
      expect(result).toEqual(bids);
    });
  });

  describe('createAuction', () => {
    it('should call service with the correct arguments', async () => {
      const mockFiles = [{ filename: '2026-01-01-watch.jpg' }] as Express.Multer.File[];
      const req = { user: { id: 42 } };
      const auctionData = {
        itemName: 'Watch',
        description: 'Vintage watch',
        year: '2026',
        month: '6',
        day: '15',
        hour: '10',
        minute: '30',
      };
      const created = { id: 1, itemName: 'Watch' } as Auction;
      auctionsService.createAuction.mockResolvedValue(created);

      const result = await controller.createAuction(mockFiles, req, auctionData);

      expect(auctionsService.createAuction).toHaveBeenCalledWith(
        42, 'Watch', 'Vintage watch', ['2026-01-01-watch.jpg'],
        '2026', '6', '15', '10', '30',
        undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined,
      );
      expect(result).toEqual(created);
    });
  });

  describe('bidAuction', () => {
    it('should call service with auctionId, userId, and bidAmount from request', async () => {
      const req = { user: { id: 10 } };
      const bid = { auctionId: 5, bidAmount: 250 };
      const bids = [{ bidAmount: 250, userId: 10, effectivePrice: 250 }] as any[];
      auctionsService.bidAuction.mockResolvedValue(bids);

      const result = await controller.bidAuction(req, bid);

      expect(auctionsService.bidAuction).toHaveBeenCalledWith(5, 10, 250);
      expect(result).toEqual(bids);
    });
  });
});
