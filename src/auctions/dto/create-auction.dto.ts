import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateAuctionDto {
  @ApiProperty({
    example: 'string',
    description: 'The name of the auction item',
    required: true,
  })
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({
    example: 'string',
    description: 'The description of the auction item',
    required: true,
  })
  @IsNotEmpty()
  description: string;
}
