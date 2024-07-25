// src/modules/qr/dto/campaign.dto.ts

import { IsString, IsNotEmpty, IsDateString, IsNumber, IsObject } from 'class-validator';
import { Types } from 'mongoose';

export class CampaignDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

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

  @IsNumber()
  @IsNotEmpty()
  target: number;

  @IsObject()
  @IsNotEmpty()
  reward: {
    tokens: number;
    products: string[];
  };

  @IsString()
  @IsNotEmpty()
  readonly ownerTelegramId: string;

  @IsString()
  @IsNotEmpty()
  readonly ownerAddress: string;
}

export class CampaignInsertDto {

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

  @IsNumber()
  @IsNotEmpty()
  target: number;

  @IsObject()
  @IsNotEmpty()
  reward: {
    tokens: number;
    products: string[];
  };

  @IsString()
  @IsNotEmpty()
  readonly ownerTelegramId: string;

  @IsString()
  @IsNotEmpty()
  readonly ownerAddress: string;
}

