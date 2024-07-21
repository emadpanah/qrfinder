// src/modules/qr/dto/campaign.dto.ts

import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
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

  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsDateString()
  @IsNotEmpty()
  expirationDate: Date;
}
