import { IsString, IsNotEmpty, IsNumber, IsDate, IsObject, IsBoolean, isNumber } from 'class-validator';
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

  @IsNumber()
  @IsNotEmpty()
  qrTarget: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  qrOrderType: 'ordered' | 'unordered';

  @IsString()
  @IsNotEmpty()
  achievementType: 'qrcode' | 'taptoken' | 'bet' | 'dailyvisit' | 'vote' | 'inviteuser';

  @IsBoolean()
  @IsNotEmpty()
  qrProofByLocation: boolean;

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

  @IsNumber()
  @IsNotEmpty()
  qrTarget: number;
  
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  qrOrderType: 'ordered' | 'unordered';

  @IsString()
  @IsNotEmpty()
  achievementType: 'qrcode' | 'taptoken' | 'bet' | 'dailyvisit' | 'vote' | 'inviteuser';

  @IsBoolean()
  @IsNotEmpty()
  qrProofByLocation: boolean;

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
