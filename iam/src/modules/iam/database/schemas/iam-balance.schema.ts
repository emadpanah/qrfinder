import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BalanceDocument = Balance & Document;

@Schema({ collection: '_iambalances' })
export class Balance {
  @Prop({ type: Types.ObjectId, ref: 'IAMUser', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  transactionType: 'deposit' | 'withdraw' | 'achievementsreward' | 'payment' | 'walletsync' ;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'Currency', required: true })
  currency: Types.ObjectId;

  @Prop({ required: true })
  transactionEntityId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ required: true })
  balanceAfterTransaction: number;
  
}

 const BalanceSchema = SchemaFactory.createForClass(Balance);

//const AchievementSelectedSchema = SchemaFactory.createForClass(AchievementSelected);
 
// Create a unique index on achievementId and userId
BalanceSchema.index({ transactionEntityId: 1, userId: 1}, { unique: true });

export { BalanceSchema };
