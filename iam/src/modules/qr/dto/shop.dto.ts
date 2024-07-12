// shop.dto.ts
import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import { Types } from 'mongoose';
export class ShopDto {
  @IsString()
  @IsNotEmpty()
  Id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  campaigns: string[];
}
