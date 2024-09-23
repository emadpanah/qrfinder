// src/modules/qr/dto/campaign.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsMongoId,
  ArrayMinSize,
  ValidateNested,
  IsUrl,
  IsDate,
} from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { Sanitize } from 'class-sanitizer';
import sanitizeHtml from 'sanitize-html';

function htmlSanitizer(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [], 
    allowedAttributes: {}, 
  });
}

// Nested DTO for rewards
export class RewardDto {
  @IsNumber()
  @IsNotEmpty()
  tokens: number;

  @IsString({ each: true })
  @ArrayMinSize(0)
  products: string[];
}

// DTO for inserting a new campaign
export class CampaignInsertDto {
  @IsMongoId()
  @IsNotEmpty()
  shopId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer) 
  name: string;

  @IsString()
  @Sanitize(htmlSanitizer)
  description: string;

  @IsString()
  @IsUrl()
  videoUrl: string;

  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsNumber()
  @IsNotEmpty()
  expirationDate: number;

  @IsNumber()
  target: number;

  @IsObject()
  @ValidateNested()
  @Type(() => RewardDto)
  reward: RewardDto;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
  readonly ownerTelegramId: string;

  @IsString()
  @IsNotEmpty()
  readonly ownerAddress: string;
}


export class CampaignDto extends CampaignInsertDto {
  @IsMongoId()
  @IsNotEmpty()
  _id: Types.ObjectId;
}
