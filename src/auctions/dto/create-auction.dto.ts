import { IsNotEmpty, IsNumberString } from 'class-validator';
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

  @ApiProperty({
    example: '2023',
    description: 'The year of starting the auction',
    required: true,
  })
  @IsNotEmpty()
  @IsNumberString()
  year: string;

  @ApiProperty({
    example: '1',
    description: 'The month of starting the auction',
    required: true,
  })
  @IsNotEmpty()
  @IsNumberString()
  month: string;

  @ApiProperty({
    example: '1',
    description: 'The day of starting the auction',
    required: true,
  })
  @IsNotEmpty()
  @IsNumberString()
  day: string;

  @ApiProperty({
    example: '1',
    description: 'The hour of starting the auction',
    required: true,
  })
  @IsNotEmpty()
  @IsNumberString()
  hour: string;

  @ApiProperty({
    example: '1',
    description: 'The minute of starting the auction',
    required: true,
  })
  @IsNotEmpty()
  @IsNumberString()
  minute: string;
}
