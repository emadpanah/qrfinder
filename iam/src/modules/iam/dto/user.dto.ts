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
  chatId: string;

  @IsNumber()
  @IsNotEmpty()
  createdDate: number;
}

export class UserInsertDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

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
}
