import { IsString, IsNotEmpty, IsNumberString, IsNumber, IsDateString } from 'class-validator';
import { Types } from 'mongoose';

export class QrScanDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsNumberString()
  @IsNotEmpty()
  qrCodeId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lon: number;
  
  @IsDateString()
  @IsNotEmpty()
  addedDate: Date;  
}


export class QrScanFullDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsNumberString()
  @IsNotEmpty()
  qrCodeId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lon: number;

  @IsString()
  @IsNotEmpty()
  link: string;
  
  @IsDateString()
  @IsNotEmpty()
  addedDate: Date;  

}