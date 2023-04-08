import { Module } from '@nestjs/common';
import { UserController } from './controllers/user/user.controller';
import { UserService } from './services/user/user.service';
import { AuthService } from './services/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { JwtService } from '@nestjs/jwt';
import { LocalStrategy } from './services/auth/local-auth.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './services/auth/jwt-auth.strategy';
@Module({
  controllers: [UserController],
  providers: [UserService, AuthService, JwtService, LocalStrategy, JwtStrategy],
  imports: [TypeOrmModule.forFeature([User]), PassportModule],
})
export class UserModule {}
