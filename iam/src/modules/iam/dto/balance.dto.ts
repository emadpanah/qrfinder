import { IsString, IsNotEmpty, IsNumber, IsMongoId, IsIn, IsDateString } from 'class-validator';
import { Types } from 'mongoose';

export class BalanceDto {
    
  @IsString()
  @IsNotEmpty()  
  _id:Types.ObjectId;
  
  @IsString()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  @IsIn(['deposit', 'withdraw', 'achievementsreward', 'payment', 'walletsync'])
  transactionType: 'deposit' | 'withdraw' | 'achievementsreward' | 'payment' | 'walletsync';

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  transactionEntityId: string;

  @IsNumber()
  @IsNotEmpty()
  timestamp: number;

  @IsNumber()
  @IsNotEmpty()
  balanceAfterTransaction: number;
  
}

