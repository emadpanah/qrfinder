import { IsString, IsNotEmpty, IsNumber, IsDate, IsObject, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';
import { Sanitize } from 'class-sanitizer';
import sanitizeHtml from 'sanitize-html';

// Custom HTML sanitizer
function htmlSanitizer(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}, // No attributes allowed
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

  @IsDate()
  @IsNotEmpty()
  expirationDate: Date;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsBoolean()
  @IsNotEmpty()
  enable: boolean;

  @IsDate()
  @IsNotEmpty()
  addedDate: Date;
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

  @IsDate()
  @IsNotEmpty()
  expirationDate: Date;
  
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsBoolean()
  @IsNotEmpty()
  enable: boolean;

  @IsDate()
  @IsNotEmpty()
  addedDate: Date;
}
