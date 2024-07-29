// src/modules/qr/dto/qrcode.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsDate, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class QRCodeDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  achievementId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  link: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsNumber()
  @IsNotEmpty()
  order: number;

}


export class QRCodeInertDto {

  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  achievementId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  link: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

}
