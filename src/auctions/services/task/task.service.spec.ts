import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { Auction, AuctionToUser, Notification } from 'src/typeorm';

describe('TaskService', () => {
  let service: TaskService;
  let auctionRepo: { find: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    auctionRepo = module.get(getRepositoryToken(Auction));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleCron', () => {
    it('should update pending auctions past their startDate to active', async () => {
      const pendingAuctions = [
        { id: 1, status: 'pending', startDate: new Date('2026-01-01') },
        { id: 2, status: 'pending', startDate: new Date('2026-01-02') },
      ] as Auction[];

      auctionRepo.find.mockResolvedValue(pendingAuctions);
      auctionRepo.save.mockResolvedValue(undefined);

      await service.handleCron();

      for (const auction of pendingAuctions) {
        expect(auction.status).toBe('active');
      }
      expect(auctionRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should do nothing when there are no pending auctions past startDate', async () => {
      auctionRepo.find.mockResolvedValue([]);

      await service.handleCron();

      expect(auctionRepo.save).not.toHaveBeenCalled();
    });
  });
});
