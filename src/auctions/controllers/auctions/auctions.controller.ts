import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuctionsService } from 'src/auctions/services/auctions/auctions.service';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Get('/')
  async getAuctions() {
    return await this.auctionsService.getAuctions();
  }

  @Get('/:id')
  async getAuctionById(@Param('id') id: number) {
    return await this.auctionsService.getAuctionById(id);
  }

  @Get('/owner/:id')
  async getAuctionByUserId(@Param('id') id: number) {
    return await this.auctionsService.getAuctionsByUserId(id);
  }

  @Get('/winner/:id')
  async getAuctionByWinnerId(@Param('id') id: number) {
    return await this.auctionsService.getAuctionsByWinnerId(id);
  }

  @Get('/bidder/:id')
  async getAuctionByBidderId(@Param('id') id: number) {
    return await this.auctionsService.getAuctionsByBidderId(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/')
  async createAuction(
    @Request() req: any,
    @Body('itemName') itemName: string,
    @Body('description') description: string,
  ) {
    return await this.auctionsService.createAuction(
      req.user.id,
      itemName,
      description,
    );
  }
}
