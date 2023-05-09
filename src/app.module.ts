import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuctionsModule } from './auctions/auctions.module';
import { ScheduleModule } from '@nestjs/schedule';

import entities from './typeorm';
@Module({
  imports: [
    UserModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST') || 'localhost',
        port: Number(configService.get('POSTGRES_PORT')) || 5432,
        username: configService.get('POSTGRES_USER') || 'postgres',
        password: configService.get('POSTGRES_PASSWORD') || 'root',
        database: configService.get('POSTGRES_DATABASE') || 'nest',
        entities: entities,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuctionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
