import { Module } from '@nestjs/common';
import { UserController } from './controllers/user/user.controller';

@Module({
  controllers: [UserController],
  providers: [],
})
export class UserModule {}
