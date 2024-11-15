// src/modules/data/schemas/rsi.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_rsidata' })
export class RSIData {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, type: Number })
  RSI: number;

  @Prop({ required: true, type: Number })
  time: number;
}

export type RSIDataDocument = RSIData & Document;
export const RSIDataSchema = SchemaFactory.createForClass(RSIData);
