import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsBoolean,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Types } from 'mongoose';
import { Sanitize } from 'class-sanitizer';
import sanitizeHtml from 'sanitize-html';


function htmlSanitizer(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [], 
    allowedAttributes: {}, 
  });
}

export class AchievementSelectedDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  achievementId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
  inviteLink: string;

  @IsString()
  @IsOptional()
  parentId: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  addedDate: number;

  @IsNumber()
  @IsNotEmpty()
  doneDate: number;
}

export class AchievementSelectedRefDto {
  @IsString()
  @IsNotEmpty()
  campaignId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  achievementId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
  name: string;

  @IsString()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
  inviteLink: string;

  @IsString()
  @IsOptional()
  parentId: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  addedDate: number;
}

export class AchievementSelectedFullDto {
  @IsString()
  @IsNotEmpty()
  campaignId: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  doneDate: number;

  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  achievementId: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  qrTarget: number;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
  name: string;

  @IsObject()
  @IsNotEmpty()
  reward: {
    tokens: number;
    products: string[];
  };

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

  @IsNumber()
  @IsNotEmpty()
  expirationDate: number;

  @IsString()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
  inviteLink: string;

  @IsString()
  @IsOptional()
  parentId: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  addedDate: number;

  @IsNumber()
  @IsNotEmpty()
  startDate: number;
}

export class AchievementSelectedInsertDto {
  @IsString()
  @IsNotEmpty()
  achievementId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
  inviteLink: string;

  @IsString()
  @IsOptional()
  parentId: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  addedDate: number;
}

