import { IsString, IsNotEmpty } from 'class-validator';
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

export class ShopDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  shopId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer) // Sanitize the name field
  name: string;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer) // Sanitize the description field
  description: string;
}

export class ShopInsertDto {
  @IsString()
  @IsNotEmpty()
  shopId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer) // Sanitize the name field
  name: string;

  @IsString()
  @IsNotEmpty()
  @Sanitize(htmlSanitizer) // Sanitize the description field
  description: string;
}
