// user.dto.ts
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Length,
  IsDateString,
  IsNumber,
  IsOptional,
  isString,
} from 'class-validator';
import { Types } from 'mongoose';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsString()
  @IsOptional()
  telegramFirstName: string;

  @IsString()
  @IsOptional()
  telegramLastName: string;

  @IsString()
  @IsOptional()
  telegramUserName: string;

  @IsOptional()
  telegramLanCode: string;

  @IsString()
  telegramID: string;

  @IsString()
  mobile: string;

  @IsNumber()
  @IsNotEmpty()
  createdDate: number;

  @IsString()
  @IsNotEmpty()
  clientSecret: string;
    
  @IsString()
  @IsOptional()
  alias: string;
}

export class UserInsertDto {

  @IsString()
  mobile: string; 

  @IsString()
  telegramID: string;

  @IsString()
  chatId: string;

  @IsString()
  @IsOptional()
  telegramFirstName: string;

  @IsString()
  @IsOptional()
  telegramLastName: string;

  @IsString()
  @IsOptional()
  telegramUserName: string;

  @IsOptional()
  telegramLanCode: string;

  @IsString()
  @IsNotEmpty()
  clientSecret: string;
  
  @IsString()
  @IsOptional()
  alias: string;
}
