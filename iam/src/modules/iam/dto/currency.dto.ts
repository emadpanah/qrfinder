import { IsString, IsNotEmpty, IsBoolean, IsIn } from 'class-validator';
import { Types } from 'mongoose';

export class CurrencyDto {

  @IsString()
  @IsNotEmpty()  
  _id:Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsIn(['fiat', 'crypto'])
  type: 'fiat' | 'crypto';

  @IsBoolean()
  isDefault: boolean;
}
