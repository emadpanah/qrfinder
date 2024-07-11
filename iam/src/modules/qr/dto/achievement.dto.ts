import { IsString, IsNotEmpty, IsNumber, IsDate, IsMongoId, IsObject } from 'class-validator';
import { Types } from 'mongoose';

export class AchievementDto {
  @IsMongoId()
  @IsNotEmpty()
  campaignId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  type: 'ordered' | 'unordered';

  @IsNumber()
  @IsNotEmpty()
  target: number;

  @IsObject()
  @IsNotEmpty()
  reward: {
    tokens: number;
    products: string[];
  };

  @IsDate()
  @IsNotEmpty()
  expirationDate: Date;

  @IsObject()
  @IsNotEmpty()
  expectedLocation: {
    lat: number;
    lon: number;
    allowedRange: number;
  };
}

export class AchievementInsertDto {
  @IsMongoId()
  @IsNotEmpty()
  campaignId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  type: 'ordered' | 'unordered';

  @IsNumber()
  @IsNotEmpty()
  target: number;

  @IsObject()
  @IsNotEmpty()
  reward: {
    tokens: number;
    products: string[];
  };

  @IsDate()
  @IsNotEmpty()
  expirationDate: Date;

  @IsObject()
  @IsNotEmpty()
  expectedLocation: {
    lat: number;
    lon: number;
    allowedRange: number;
  };
}
