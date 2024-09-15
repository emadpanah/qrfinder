// src/modules/qr/dto/campaign.dto.ts

// src/modules/qr/dto/campaign.dto.ts

// src/modules/qr/dto/campaign.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsObject,
  IsMongoId,
  ArrayNotEmpty,
  ArrayMinSize,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { Sanitize } from 'class-sanitizer';
import sanitizeHtml from 'sanitize-html';

// Custom HTML sanitizer
function htmlSanitizer(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}, // No attributes allowed
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
  @Sanitize(htmlSanitizer) // Sanitizes HTML input
  name: string;

  @IsString()
  @Sanitize(htmlSanitizer) // Sanitizes HTML input
  description: string;

  @IsString()
  @IsUrl()
  videoUrl: string;

  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsDateString()
  @IsNotEmpty()
  expirationDate: Date;

  @IsNumber()
  target: number;

  @IsObject()
  @ValidateNested()
  @Type(() => RewardDto)
  reward: RewardDto;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer) // Sanitizes HTML input
  readonly ownerTelegramId: string;

  @IsString()
  @IsNotEmpty()
  readonly ownerAddress: string;
}

// DTO for a campaign, includes ID field
export class CampaignDto extends CampaignInsertDto {
  @IsMongoId()
  @IsNotEmpty()
  _id: Types.ObjectId;
}




// import { IsString, IsNotEmpty, IsDateString, IsNumber, IsObject } from 'class-validator';
// import { Types } from 'mongoose';

// export class CampaignDto {
//   @IsString()
//   @IsNotEmpty()
//   _id: Types.ObjectId;

//   @IsString()
//   @IsNotEmpty()
//   shopId: Types.ObjectId;

//   @IsString()
//   @IsNotEmpty()
//   name: string;

//   @IsString()
//   @IsNotEmpty()
//   description: string;

//   @IsString()
//   @IsNotEmpty()
//   videoUrl: string;

//   @IsString()
//   @IsNotEmpty()
//   imageUrl: string;

//   @IsDateString()
//   @IsNotEmpty()
//   expirationDate: Date;

//   @IsNumber()
//   @IsNotEmpty()
//   target: number;

//   @IsObject()
//   @IsNotEmpty()
//   reward: {
//     tokens: number;
//     products: string[];
//   };

//   @IsString()
//   @IsNotEmpty()
//   readonly ownerTelegramId: string;

//   @IsString()
//   @IsNotEmpty()
//   readonly ownerAddress: string;
// }

// export class CampaignInsertDto {

//   @IsString()
//   @IsNotEmpty()
//   shopId: Types.ObjectId;

//   @IsString()
//   @IsNotEmpty()
//   name: string;

//   @IsString()
//   @IsNotEmpty()
//   description: string;

//   @IsString()
//   @IsNotEmpty()
//   videoUrl: string;

//   @IsString()
//   @IsNotEmpty()
//   imageUrl: string;

//   @IsDateString()
//   @IsNotEmpty()
//   expirationDate: Date;

//   @IsNumber()
//   @IsNotEmpty()
//   target: number;

//   @IsObject()
//   @IsNotEmpty()
//   reward: {
//     tokens: number;
//     products: string[];
//   };

//   @IsString()
//   @IsNotEmpty()
//   readonly ownerTelegramId: string;

//   @IsString()
//   @IsNotEmpty()
//   readonly ownerAddress: string;
// }

