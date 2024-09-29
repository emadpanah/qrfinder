// user.dto.ts
import { Prop } from '@nestjs/mongoose';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Length,
  IsDateString,
} from 'class-validator';
import { Types } from 'mongoose';

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'IAMUser', required: true })
  userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  token: string;

  @IsDateString()
  @IsNotEmpty()
  createdDate: string;
}
