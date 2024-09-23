import { IsString, IsNotEmpty, IsNumber, IsDate, IsObject, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';
import { Sanitize } from 'class-sanitizer';
import sanitizeHtml from 'sanitize-html';


function htmlSanitizer(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [], 
    allowedAttributes: {}, 
  });
}

export class AchievementDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  campaignId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  qrTarget: number;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
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

  @IsNumber()
  @IsNotEmpty()
  expirationDate: number;

  @IsNumber()
  @IsNotEmpty()
  startDate: number;

  @IsBoolean()
  @IsNotEmpty()
  enable: boolean;

  @IsNumber()
  @IsNotEmpty()
  addedDate: number;
}

export class AchievementInsertDto {

  @IsString()
  @IsNotEmpty()
  campaignId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  qrTarget: number;
  
  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
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

  @IsNumber()
  @IsNotEmpty()
  expirationDate: number;
  
  @IsNumber()
  @IsNotEmpty()
  startDate: number;

  @IsBoolean()
  @IsNotEmpty()
  enable: boolean;

  @IsNumber()
  @IsNotEmpty()
  addedDate: number;
}
