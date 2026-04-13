import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class UpdateSubscriptionDto {
  @ApiProperty({ example: 'business', description: 'Subscription plan name' })
  @IsNotEmpty()
  @IsString()
  plan: string;

  @ApiProperty({
    example: '2027-12-31T00:00:00.000Z',
    description: 'Subscription expiration date',
  })
  @Type(() => Date)
  @IsDate()
  expiresAt: Date;
}
