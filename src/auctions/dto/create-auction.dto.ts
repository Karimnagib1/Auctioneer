import { IsNotEmpty, IsNumberString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiPropertyOptional({
    example: '2023',
    description: 'The year the auction ends (optional)',
  })
  @IsOptional()
  @IsNumberString()
  endYear?: string;

  @ApiPropertyOptional({
    example: '6',
    description: 'The month the auction ends (optional)',
  })
  @IsOptional()
  @IsNumberString()
  endMonth?: string;

  @ApiPropertyOptional({
    example: '15',
    description: 'The day the auction ends (optional)',
  })
  @IsOptional()
  @IsNumberString()
  endDay?: string;

  @ApiPropertyOptional({
    example: '18',
    description: 'The hour the auction ends (optional)',
  })
  @IsOptional()
  @IsNumberString()
  endHour?: string;

  @ApiPropertyOptional({
    example: '0',
    description: 'The minute the auction ends (optional)',
  })
  @IsOptional()
  @IsNumberString()
  endMinute?: string;

  @ApiPropertyOptional({
    example: 500,
    description: 'The reserve price. If no bid meets this, the auction closes with no winner.',
  })
  @IsOptional()
  @IsNumber()
  reservePrice?: number;

  @ApiPropertyOptional({
    example: 1000,
    description: 'The buy-now price. Bidding this amount immediately closes the auction.',
  })
  @IsOptional()
  @IsNumber()
  buyNowPrice?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Minutes before endDate within which a bid extends the auction.',
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  extensionMinutes?: number;

  @ApiPropertyOptional({
    example: 10,
    description: "Buyer's premium percentage added to the bid amount.",
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  buyerPremiumPercent?: number;
}
