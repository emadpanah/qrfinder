import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CurrencyDocument = Currency & Document;

@Schema({ collection: '_iamcurrencies' })
export class Currency {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  type: 'fiat' | 'crypto';

  @Prop({ required: true, default: false })
  isDefault: boolean;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
