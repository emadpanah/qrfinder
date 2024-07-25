import { IsString, IsNotEmpty, IsNumber, IsDate, IsObject } from 'class-validator';
import { Types } from 'mongoose';

export class AchievementDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsString()
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

  @IsObject()
  @IsNotEmpty()
  reward: {
    tokens: number;
    products: string[];
  };

  @IsDate()
  @IsNotEmpty()
  expirationDate: Date;
}


export class AchievementInsertDto {

  @IsString()
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

  @IsObject()
  @IsNotEmpty()
  reward: {
    tokens: number;
    products: string[];
  };

  @IsDate()
  @IsNotEmpty()
  expirationDate: Date;
}
