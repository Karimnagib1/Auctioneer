import { Module } from '@nestjs/common';
import { UserController } from './controllers/user/user.controller';
import { ServicesService } from './services/services.service';
import { UserService } from './services/user/user.service';
import { AuthService } from './services/auth/auth.service';

@Module({
  controllers: [UserController],
  providers: [ServicesService, UserService, AuthService],
})
export class UserModule {}
