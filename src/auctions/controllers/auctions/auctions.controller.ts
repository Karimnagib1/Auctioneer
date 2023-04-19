import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuctionsService } from 'src/auctions/services/auctions/auctions.service';
import { CreateAuctionDto } from 'src/auctions/dto/create-auction.dto';

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
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard('jwt'))
  @Post('/')
  async createAuction(
    @Request() req: any,
    @Body() auctionData: CreateAuctionDto,
  ) {
    return await this.auctionsService.createAuction(
      req.user.id,
      auctionData.itemName,
      auctionData.description,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/bid')
  async bidAuction(
    @Request() req: any,
    @Body('auctionId') auctionId: number,
    @Body('bid') bid: number,
  ) {
    return await this.auctionsService.bidAuction(auctionId, req.user.id, bid);
  }
}
