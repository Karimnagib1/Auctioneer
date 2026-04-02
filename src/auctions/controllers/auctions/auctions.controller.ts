import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuctionsService } from 'src/auctions/services/auctions/auctions.service';
import { CreateAuctionDto } from 'src/auctions/dto/create-auction.dto';
import { BidDto } from 'src/auctions/dto/bid.dto';
import { ProxyBidDto } from 'src/auctions/dto/proxy-bid.dto';
import { RelistAuctionDto } from 'src/auctions/dto/relist-auction.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Get('/')
  async getAuctions() {
    return await this.auctionsService.getAuctions();
  }

  @Get('/image/:imgName')
  getAuctionImage(@Param('imgName') image, @Res() res) {
    return res.sendFile(image, { root: './itemImages' });
  }

  // NOTE: specific routes must come BEFORE /:id

  @Get('/owner/:id')
  async getAuctionByUserId(@Param('id') id: number) {
    return await this.auctionsService.getAuctionsByUserId(id);
  }

  @Get('/winner/:id')
  async getAuctionByWinnerId(@Param('id') id: number) {
    return await this.auctionsService.getAuctionsByWinnerId(id);
  }

  @Get('/bidder/:id')
  async getAuctionsByBidderId(@Param('id') id: number) {
    return await this.auctionsService.getAuctionsByBidderId(id);
  }

  @Get('/bids/:auctionId')
  async getBidsByAuctionId(@Param('auctionId') auctionId: number) {
    return await this.auctionsService.getBidsByAuctionId(auctionId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/notifications')
  async getNotifications(@Request() req: any) {
    return await this.auctionsService.getNotificationsForUser(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('/notifications/:id/read')
  async markNotificationRead(
    @Param('id') id: number,
    @Request() req: any,
  ) {
    return await this.auctionsService.markNotificationRead(id, req.user.id);
  }

  @Get('/analytics/:auctionId')
  async getAuctionAnalytics(@Param('auctionId') auctionId: number) {
    return await this.auctionsService.getAuctionAnalytics(auctionId);
  }

  @Get('/:id')
  async getAuctionById(@Param('id') id: number) {
    return await this.auctionsService.getAuctionById(id);
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard('jwt'))
  @Post('/')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './itemImages',
        filename: (req, file, cb) => {
          return cb(
            null,
            `${new Date().toISOString().replace(/:/g, '-')}-${file.originalname}`,
          );
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async createAuction(
    @UploadedFiles() images: Express.Multer.File[],
    @Request() req: any,
    @Body() auctionData: CreateAuctionDto,
  ) {
    const filenames = (images ?? []).map((f) => f.filename);
    return await this.auctionsService.createAuction(
      req.user.id,
      auctionData.itemName,
      auctionData.description,
      filenames,
      auctionData.year,
      auctionData.month,
      auctionData.day,
      auctionData.hour,
      auctionData.minute,
      auctionData.endYear,
      auctionData.endMonth,
      auctionData.endDay,
      auctionData.endHour,
      auctionData.endMinute,
      auctionData.reservePrice,
      auctionData.buyNowPrice,
      auctionData.extensionMinutes,
      auctionData.buyerPremiumPercent,
    );
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard('jwt'))
  @Post('/bid')
  async bidAuction(@Request() req: any, @Body() bid: BidDto) {
    return await this.auctionsService.bidAuction(
      bid.auctionId,
      req.user.id,
      bid.bidAmount,
    );
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard('jwt'))
  @Post('/proxy-bid')
  async setProxyBid(@Request() req: any, @Body() proxyBidDto: ProxyBidDto) {
    return await this.auctionsService.setProxyBid(
      proxyBidDto.auctionId,
      req.user.id,
      proxyBidDto.maxAmount,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/:id/cancel')
  async cancelAuction(@Param('id') id: number, @Request() req: any) {
    return await this.auctionsService.cancelAuction(id, req.user.id);
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard('jwt'))
  @Post('/:id/relist')
  async relistAuction(
    @Param('id') id: number,
    @Request() req: any,
    @Body() relistDto: RelistAuctionDto,
  ) {
    return await this.auctionsService.relistAuction(
      id,
      req.user.id,
      relistDto.endYear,
      relistDto.endMonth,
      relistDto.endDay,
      relistDto.endHour,
      relistDto.endMinute,
      relistDto.startYear,
      relistDto.startMonth,
      relistDto.startDay,
      relistDto.startHour,
      relistDto.startMinute,
      relistDto.reservePrice,
      relistDto.buyNowPrice,
    );
  }
}
