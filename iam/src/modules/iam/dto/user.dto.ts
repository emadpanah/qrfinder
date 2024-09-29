// user.dto.ts
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Length,
  IsDateString,
} from 'class-validator';
import { Types } from 'mongoose';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsString()
  telegramID: string;

  @IsDateString()
  @IsNotEmpty()
  createdDate: string;
}

export class UserInsertDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsString()
  telegramID: string;

  @IsString()
  @IsNotEmpty()
  clientSecret: string;
}
