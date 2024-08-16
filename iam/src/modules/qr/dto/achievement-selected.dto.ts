import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsDateString,
  IsObject,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Types } from 'mongoose';
import { Sanitize } from 'class-sanitizer';
import sanitizeHtml from 'sanitize-html';

// Custom HTML sanitizer function
function htmlSanitizer(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}, // No attributes allowed
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

  @IsDateString()
  @IsNotEmpty()
  addedDate: Date;

  @IsDateString()
  @IsNotEmpty()
  doneDate: Date;
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

  @IsDateString()
  @IsNotEmpty()
  addedDate: Date;
}

export class AchievementSelectedFullDto {
  @IsString()
  @IsNotEmpty()
  campaignId: Types.ObjectId;

  @IsDateString()
  @IsNotEmpty()
  doneDate: Date;

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

  @IsDateString()
  @IsNotEmpty()
  expirationDate: Date;

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

  @IsDateString()
  @IsNotEmpty()
  addedDate: Date;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;
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

  @IsDateString()
  @IsNotEmpty()
  addedDate: Date;
}



// import { IsString, IsNotEmpty, IsArray, IsOptional, IsDateString, IsObject, IsDate, IsBoolean, IsNumber } from 'class-validator';
// import { Types } from 'mongoose';

// export class AchievementSelectedDto {

//     @IsString()
//     @IsNotEmpty()  
//   _id:Types.ObjectId;
  
//   @IsString()
//   @IsNotEmpty()
//   achievementId: Types.ObjectId;

//   @IsString()
//   @IsNotEmpty()
//   userId: Types.ObjectId;

//   @IsString()
//   @IsNotEmpty()
//   inviteLink: string;

//   @IsString()
//   @IsOptional()
//   parentId: Types.ObjectId; 

//   @IsDateString()
//   @IsNotEmpty()
//   addedDate: Date;
  
//   @IsDateString()
//   @IsNotEmpty()
//   doneDate: Date;

// }

// export class AchievementSelectedRefDto {

//   @IsString()
//   @IsNotEmpty()
//   campaignId: Types.ObjectId;
  
//   @IsString()
//   @IsNotEmpty()  
//   _id:Types.ObjectId;
  
//   @IsString()
//   @IsNotEmpty()
//   achievementId: Types.ObjectId;
  
//   @IsString()
//   @IsNotEmpty()
//   name: string;
  
//   @IsString()
//   @IsNotEmpty()
//   userId: Types.ObjectId;
  
//   @IsString()
//   @IsNotEmpty()
//   inviteLink: string;
  
//   @IsString()
//   @IsOptional()
//   parentId: Types.ObjectId; 
  
//   @IsDateString()
//   @IsNotEmpty()
//   addedDate: Date;  
  
//   }

// export class AchievementSelectedFullDto {

// @IsString()
// @IsNotEmpty()
// campaignId: Types.ObjectId;

// @IsDateString()
// @IsNotEmpty()
// doneDate: Date;

// @IsString()
// @IsNotEmpty()  
// _id:Types.ObjectId;

// @IsString()
// @IsNotEmpty()
// achievementId: Types.ObjectId;

// @IsNumber()
// @IsNotEmpty()
// qrTarget: number;

// @IsString()
// @IsNotEmpty()
// name: string;

// @IsObject()
// @IsNotEmpty()
// reward: {
//   tokens: number;
//   products: string[];
// };

// @IsString()
// @IsNotEmpty()
// description: string;

// @IsString()
// @IsNotEmpty()
// qrOrderType: 'ordered' | 'unordered';

// @IsString()
// @IsNotEmpty()
// achievementType: 'qrcode' | 'taptoken' | 'bet' | 'dailyvisit' | 'vote' | 'inviteuser';

// @IsBoolean()
// @IsNotEmpty()
// qrProofByLocation: boolean;

// @IsDateString()
// @IsNotEmpty()
// expirationDate: Date;

// @IsString()
// @IsNotEmpty()
// userId: Types.ObjectId;

// @IsString()
// @IsNotEmpty()
// inviteLink: string;

// @IsString()
// @IsOptional()
// parentId: Types.ObjectId;  // This field will store the parent user who referred this achievement

// @IsDateString()
// @IsNotEmpty()
// addedDate: Date;  // This field will store the date when the achievement was added

// @IsDateString()
// @IsNotEmpty()
// startDate: Date;

// }


// export class AchievementSelectedInsertDto {
  
//   @IsString()
//   @IsNotEmpty()
//   achievementId: Types.ObjectId;

//   @IsString()
//   @IsNotEmpty()
//   userId: Types.ObjectId;

//   @IsString()
//   @IsNotEmpty()
//   inviteLink: string;

//   @IsString()
//   @IsOptional()
//   parentId: Types.ObjectId;  // This field will store the parent user who referred this achievement

//   @IsDateString()
//   @IsNotEmpty()
//   addedDate: Date;  // This field will store the date when the achievement was added

// }