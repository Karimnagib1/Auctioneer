import { Module } from '@nestjs/common';
import { MyGateway } from './my-gateway.gateway';

@Module({
  providers: [MyGateway],
  exports: [MyGateway],
})
export class MyGatewayModule {}
