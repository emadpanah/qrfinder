// campaign.dto.ts
import { IsString, IsNotEmpty, IsArray, IsDateString } from 'class-validator';
import { Types } from 'mongoose';

export class CampaignDto {
  @IsString()
  @IsNotEmpty()
  Id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  shopId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  achievements: string[];

  @IsDateString()
  @IsNotEmpty()
  expirationDate: Date;
}
