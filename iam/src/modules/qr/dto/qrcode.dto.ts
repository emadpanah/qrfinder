// src/modules/qr/dto/qrcode.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsMongoId,
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

export class QRCodeDto {
  @IsMongoId()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  achievementId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
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
  @IsMongoId()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  achievementId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
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
