import { IsString, IsNotEmpty, IsArray, IsOptional, IsDateString, IsObject, IsDate } from 'class-validator';
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
  parentId: Types.ObjectId;  // This field will store the parent user who referred this achievement

  @IsDateString()
  @IsNotEmpty()
  addedDate: Date;  // This field will store the date when the achievement was added

}

export class AchievementSelectedFullDto {

  @IsString()
  @IsNotEmpty()  
_id:Types.ObjectId;

@IsString()
@IsNotEmpty()
achievementId: Types.ObjectId;

@IsString()
@IsNotEmpty()
name: string;

@IsObject()
@IsNotEmpty()
reward: {
  tokens: number;
  products: string[];
};

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