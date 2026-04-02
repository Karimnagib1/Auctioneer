import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { Auction, AuctionToUser, Notification } from 'src/typeorm';

describe('TaskService', () => {
  let service: TaskService;
  let module: TestingModule;
  let auctionRepo: { find: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Auction),
          useValue: { find: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(AuctionToUser),
          useValue: { createQueryBuilder: jest.fn() },
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: { create: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    auctionRepo = module.get(getRepositoryToken(Auction)) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleCron', () => {
    let auctionToUserRepo: { createQueryBuilder: jest.Mock };
    let notificationRepo: { create: jest.Mock; save: jest.Mock };

    beforeEach(() => {
      auctionToUserRepo = module.get(getRepositoryToken(AuctionToUser));
      notificationRepo = module.get(getRepositoryToken(Notification));
    });

    it('should activate pending auctions whose startDate has passed', async () => {
      const pendingAuctions = [
        { id: 1, status: 'pending', startDate: new Date('2026-01-01') },
        { id: 2, status: 'pending', startDate: new Date('2026-01-02') },
      ] as Auction[];

      // first find = pending auctions, second find = active auctions (none to close)
      auctionRepo.find
        .mockResolvedValueOnce(pendingAuctions)
        .mockResolvedValueOnce([]);

      await service.handleCron();

      for (const auction of pendingAuctions) {
        expect(auction.status).toBe('active');
      }
      expect(auctionRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should do nothing when there are no pending or active auctions', async () => {
      auctionRepo.find.mockResolvedValue([]);

      await service.handleCron();

      expect(auctionRepo.save).not.toHaveBeenCalled();
    });

    it('should close an active auction past its endDate and set the winner', async () => {
      const pastEndDate = new Date(Date.now() - 60000); // 1 minute ago
      const activeAuction = { id: 1, status: 'active', endDate: pastEndDate, itemName: 'Watch', reservePrice: null } as any;

      auctionRepo.find
        .mockResolvedValueOnce([]) // no pending
        .mockResolvedValueOnce([activeAuction]); // one active past endDate

      const bids = [
        { userId: 2, bidAmount: 500 },
        { userId: 3, bidAmount: 300 },
      ] as any[];
      const qb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(bids),
      };
      auctionToUserRepo.createQueryBuilder.mockReturnValue(qb);
      notificationRepo.create.mockReturnValue({});
      notificationRepo.save.mockResolvedValue({});
      auctionRepo.save.mockResolvedValue({});

      await service.handleCron();

      expect(activeAuction.status).toBe('closed');
      expect(activeAuction.winnerId).toBe(2);
      expect(notificationRepo.save).toHaveBeenCalledTimes(2); // winner + loser
    });

    it('should close without a winner when reserve price is not met', async () => {
      const pastEndDate = new Date(Date.now() - 60000);
      const activeAuction = { id: 1, status: 'active', endDate: pastEndDate, itemName: 'Watch', reservePrice: 1000 } as any;

      auctionRepo.find
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([activeAuction]);

      const bids = [{ userId: 2, bidAmount: 500 }] as any[];
      const qb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(bids),
      };
      auctionToUserRepo.createQueryBuilder.mockReturnValue(qb);
      notificationRepo.create.mockReturnValue({});
      notificationRepo.save.mockResolvedValue({});
      auctionRepo.save.mockResolvedValue({});

      await service.handleCron();

      expect(activeAuction.status).toBe('closed');
      expect(activeAuction.winnerId).toBeUndefined();
    });

    it('should skip active auctions whose endDate has not passed yet', async () => {
      const futureEndDate = new Date(Date.now() + 60000);
      const activeAuction = { id: 1, status: 'active', endDate: futureEndDate } as any;

      auctionRepo.find
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([activeAuction]);

      await service.handleCron();

      expect(auctionRepo.save).not.toHaveBeenCalled();
    });
  });
});
