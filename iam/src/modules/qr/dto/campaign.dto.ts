import { IsString, IsNotEmpty, IsArray, IsDateString, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CampaignDto {
  @IsMongoId()
  @IsNotEmpty()
  shopId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  achievements: Types.ObjectId[];

  @IsDateString()
  @IsNotEmpty()
  expirationDate: Date;
}

export class CampaignInsertDto {
  @IsMongoId()
  @IsNotEmpty()
  shopId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  achievements: Types.ObjectId[];

  @IsDateString()
  @IsNotEmpty()
  expirationDate: Date;
}
