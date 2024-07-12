// src/modules/qr/dto/qrcode.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsDate, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class QRCodeDto {
  @IsString()
  @IsNotEmpty()
  Id: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  achievementId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsDate()
  @IsNotEmpty()
  expirationDate: Date;
}
