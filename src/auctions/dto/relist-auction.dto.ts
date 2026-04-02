import { IsNotEmpty, IsNumberString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RelistAuctionDto {
  @ApiProperty({
    example: '2027',
    description: 'The year the new auction ends',
    required: true,
  })
  @IsNotEmpty()
  @IsNumberString()
  endYear: string;

  @ApiProperty({
    example: '6',
    description: 'The month the new auction ends',
    required: true,
  })
  @IsNotEmpty()
  @IsNumberString()
  endMonth: string;

  @ApiProperty({
    example: '15',
    description: 'The day the new auction ends',
    required: true,
  })
  @IsNotEmpty()
  @IsNumberString()
  endDay: string;

  @ApiProperty({
    example: '18',
    description: 'The hour the new auction ends',
    required: true,
  })
  @IsNotEmpty()
  @IsNumberString()
  endHour: string;

  @ApiProperty({
    example: '0',
    description: 'The minute the new auction ends',
    required: true,
  })
  @IsNotEmpty()
  @IsNumberString()
  endMinute: string;

  @ApiPropertyOptional({
    example: '2027',
    description: 'The year the new auction starts (defaults to now if omitted)',
  })
  @IsOptional()
  @IsNumberString()
  startYear?: string;

  @ApiPropertyOptional({
    example: '6',
    description: 'The month the new auction starts',
  })
  @IsOptional()
  @IsNumberString()
  startMonth?: string;

  @ApiPropertyOptional({
    example: '1',
    description: 'The day the new auction starts',
  })
  @IsOptional()
  @IsNumberString()
  startDay?: string;

  @ApiPropertyOptional({
    example: '0',
    description: 'The hour the new auction starts',
  })
  @IsOptional()
  @IsNumberString()
  startHour?: string;

  @ApiPropertyOptional({
    example: '0',
    description: 'The minute the new auction starts',
  })
  @IsOptional()
  @IsNumberString()
  startMinute?: string;

  @ApiPropertyOptional({
    example: 500,
    description: 'The reserve price for the new auction.',
  })
  @IsOptional()
  @IsNumber()
  reservePrice?: number;

  @ApiPropertyOptional({
    example: 1000,
    description: 'The buy-now price for the new auction.',
  })
  @IsOptional()
  @IsNumber()
  buyNowPrice?: number;
}
