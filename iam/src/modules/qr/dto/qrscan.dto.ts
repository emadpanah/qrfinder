import {
  IsString,
  IsNotEmpty,
  IsNumberString,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Types } from 'mongoose';
import { Sanitize } from 'class-sanitizer';
import sanitizeHtml from 'sanitize-html';

// Custom HTML sanitizer function
function htmlSanitizer(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}, // No attributes allowed
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
  @Sanitize(htmlSanitizer) // Sanitize the link field
  link: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;

  @IsDateString()
  @IsNotEmpty()
  addedDate: Date;
}
