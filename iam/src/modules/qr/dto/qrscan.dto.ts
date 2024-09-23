import {
  IsString,
  IsNotEmpty,
  IsNumberString,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Types } from 'mongoose';
import { Sanitize } from 'class-sanitizer';
import sanitizeHtml from 'sanitize-html';


function htmlSanitizer(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [], 
    allowedAttributes: {}, 
  });
}

export class QrScanDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsNumberString()
  @IsNotEmpty()
  qrCodeId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lon: number;

  @IsNumber()
  @IsNotEmpty()
  addedDate: Date;
}

export class QrScanFullDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsNumberString()
  @IsNotEmpty()
  qrCodeId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lon: number;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer) 
  link: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;

  @IsNumber()
  @IsNotEmpty()
  addedDate: Date;
}
