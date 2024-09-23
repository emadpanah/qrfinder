import { IsString, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { Sanitize } from 'class-sanitizer';
import sanitizeHtml from 'sanitize-html';


function htmlSanitizer(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [], 
    allowedAttributes: {}, 
  });
}

export class ShopDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  shopId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer) 
  description: string;
}

export class ShopInsertDto {
  @IsString()
  @IsNotEmpty()
  shopId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer) 
  name: string;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer) 
  description: string;
}
