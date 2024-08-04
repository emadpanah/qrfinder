import { IsString, IsNotEmpty, IsNumber, IsMongoId, IsIn } from 'class-validator';
import { Types } from 'mongoose';

export class BalanceDto {
    
  @IsString()
  @IsNotEmpty()  
  _id:Types.ObjectId;
  
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsIn(['deposit', 'withdraw', 'achievementsreward', 'payment'])
  transactionType: 'deposit' | 'withdraw' | 'achievementsreward' | 'payment';

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsMongoId()
  @IsNotEmpty()
  transactionEntityId: string;
  
}
