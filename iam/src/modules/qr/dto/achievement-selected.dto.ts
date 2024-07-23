import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
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
  qrCode: string;

  @IsString()
  @IsOptional()
  parentId: Types.ObjectId;  // This field will store the parent user who referred this achievement
}


export class AchievementInsertDto {
  
  @IsString()
  @IsNotEmpty()
  achievementId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  qrCode: string;

  @IsString()
  @IsOptional()
  parentId: Types.ObjectId;  // This field will store the parent user who referred this achievement
}