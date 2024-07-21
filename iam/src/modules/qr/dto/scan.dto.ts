import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';
import { Types } from 'mongoose';

export class ScanDto {
  @IsString()
  @IsNotEmpty()
  campaignId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  achievementId: Types.ObjectId;

  @IsNumberString()
  @IsNotEmpty()
  qrIndex: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumberString()
  @IsNotEmpty()
  lat: string;

  @IsNumberString()
  @IsNotEmpty()
  lon: string;
}
