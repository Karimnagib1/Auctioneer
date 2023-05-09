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
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuctionsService } from 'src/auctions/services/auctions/auctions.service';
import { CreateAuctionDto } from 'src/auctions/dto/create-auction.dto';
import { FileInterceptor } from '@nestjs/platform-express';
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
  async getAuctionsByBidderId(@Param('id') id: number) {
    return await this.auctionsService.getAuctionsByBidderId(id);
  }

  @Get('/bids/:auctionId')
  async getBidsByAuctionId(@Param('auctionId') auctionId: number) {
    return await this.auctionsService.getBidsByAuctionId(auctionId);
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard('jwt'))
  @Post('/')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './itemImages',
        filename: (req, file, cb) => {
          return cb(
            null,
            `${new Date().toISOString().replace(/:/g, '-')}-${
              file.originalname
            }`,
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
    @UploadedFile() image: Express.Multer.File,
    @Request() req: any,
    @Body() auctionData: CreateAuctionDto,
  ) {
    return await this.auctionsService.createAuction(
      req.user.id,
      auctionData.itemName,
      auctionData.description,
      image.filename,
      auctionData.year,
      auctionData.month,
      auctionData.day,
      auctionData.hour,
      auctionData.minute,
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
