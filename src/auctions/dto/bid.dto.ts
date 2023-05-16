import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class BidDto {
  @ApiProperty({
    example: 1,
    description: 'The id of the auction',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  auctionId: number;

  @ApiProperty({
    example: 100,
    description: 'The bid amount',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  bidAmount: number;
}
