import { IsString, IsNotEmpty, IsArray, IsOptional, IsDateString, IsObject, IsDate, IsBoolean, IsNumber } from 'class-validator';
import { Types } from 'mongoose';

export class AchievementSelectedDto {

    @IsString()
    @IsNotEmpty()  
  _id:Types.ObjectId;
  
  @IsString()
  @IsNotEmpty()
  achievementId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
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

export class AchievementSelectedFullDto {

@IsString()
@IsNotEmpty()
campaignId: Types.ObjectId;

@IsDateString()
@IsNotEmpty()
doneDate: Date;

@IsString()
@IsNotEmpty()  
_id:Types.ObjectId;

@IsString()
@IsNotEmpty()
achievementId: Types.ObjectId;

@IsNumber()
@IsNotEmpty()
qrTarget: number;

@IsString()
@IsNotEmpty()
name: string;

@IsObject()
@IsNotEmpty()
reward: {
  tokens: number;
  products: string[];
};

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

@IsDateString()
@IsNotEmpty()
expirationDate: Date;

@IsString()
@IsNotEmpty()
userId: Types.ObjectId;

@IsString()
@IsNotEmpty()
inviteLink: string;

@IsString()
@IsOptional()
parentId: Types.ObjectId;  // This field will store the parent user who referred this achievement

@IsDateString()
@IsNotEmpty()
addedDate: Date;  // This field will store the date when the achievement was added

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
  inviteLink: string;

  @IsString()
  @IsOptional()
  parentId: Types.ObjectId;  // This field will store the parent user who referred this achievement

  @IsDateString()
  @IsNotEmpty()
  addedDate: Date;  // This field will store the date when the achievement was added

}