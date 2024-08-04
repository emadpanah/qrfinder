import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BalanceDocument = Balance & Document;

@Schema({ collection: '_iambalances' })
export class Balance {
  @Prop({ type: Types.ObjectId, ref: 'IAMUser', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  transactionType: 'deposit' | 'withdraw' | 'achievementsreward' | 'payment';

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  transactionEntityId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ required: true })
  balanceAfterTransaction: number;
  
}

export const BalanceSchema = SchemaFactory.createForClass(Balance);
