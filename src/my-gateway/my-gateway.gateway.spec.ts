import { Test, TestingModule } from '@nestjs/testing';
import { MyGateway } from './my-gateway.gateway';

describe('MyGateway', () => {
  let gateway: MyGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyGateway],
    }).compile();

    gateway = module.get<MyGateway>(MyGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit', () => {
    it('should not throw when called with a server instance', () => {
      expect(() => gateway.afterInit({} as any)).not.toThrow();
    });
  });

  describe('handleConnection', () => {
    it('should not throw when a client connects', async () => {
      const mockClient = { id: 'client-1' } as any;
      await expect(gateway.handleConnection(mockClient)).resolves.not.toThrow();
    });
  });

  describe('handleDisconnect', () => {
    it('should not throw when a client disconnects', () => {
      const mockClient = { id: 'client-1' } as any;
      expect(() => gateway.handleDisconnect(mockClient)).not.toThrow();
    });
  });

  describe('handleEvent (joinRoom)', () => {
    it('should join the client to the specified room and return confirmation', () => {
      const mockClient = { join: jest.fn() } as any;

      const result = gateway.handleEvent(mockClient, 'auction-room-1');

      expect(mockClient.join).toHaveBeenCalledWith('auction-room-1');
      expect(result).toBe('Joined auction-room-1');
    });
  });

  describe('handleMessage (sendMessageToRoom)', () => {
    it('should emit the message to the specified room', () => {
      const mockTo = { emit: jest.fn() };
      const mockServer = { to: jest.fn().mockReturnValue(mockTo) } as any;
      gateway.server = mockServer;

      const mockClient = {} as any;
      gateway.handleMessage(mockClient, { roomName: 'auction-room-1', message: { text: 'hello' } });

      expect(mockServer.to).toHaveBeenCalledWith('auction-room-1');
      expect(mockTo.emit).toHaveBeenCalledWith('message', { text: 'hello' });
    });
  });

  describe('broadcastToRoom', () => {
    it('should emit the message to the specified room via server', () => {
      const mockTo = { emit: jest.fn() };
      const mockServer = { to: jest.fn().mockReturnValue(mockTo) } as any;
      gateway.server = mockServer;

      gateway.broadcastToRoom('5', { type: 'bid', bidAmount: 300, userId: 2 });

      expect(mockServer.to).toHaveBeenCalledWith('5');
      expect(mockTo.emit).toHaveBeenCalledWith('message', { type: 'bid', bidAmount: 300, userId: 2 });
    });
  });
});
