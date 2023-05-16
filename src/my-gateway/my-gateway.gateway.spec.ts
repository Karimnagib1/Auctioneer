import { Test, TestingModule } from '@nestjs/testing';
import { MyGatewayGateway } from './my-gateway.gateway';

describe('MyGatewayGateway', () => {
  let gateway: MyGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyGatewayGateway],
    }).compile();

    gateway = module.get<MyGatewayGateway>(MyGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
