import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import { Types } from 'mongoose';

export class ShopDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  campaigns: Types.ObjectId[];
}

export class ShopInsertDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  campaigns: Types.ObjectId[];
}
