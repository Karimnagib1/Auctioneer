import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProxyBidDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the auction to set a proxy bid for.',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  auctionId: number;

  @ApiProperty({
    example: 500,
    description: 'The maximum amount this user is willing to bid automatically.',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  maxAmount: number;
}
