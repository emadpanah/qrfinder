import { IsString, IsNotEmpty, IsNumberString, IsNumber } from 'class-validator';
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

}