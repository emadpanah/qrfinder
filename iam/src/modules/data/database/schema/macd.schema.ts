// src/modules/data/schemas/macd.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_macddata' })
export class MACDData {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, type: Number })
  MACD: number;

  @Prop({ required: true, type: Number })
  Signal: number;

  @Prop({ required: true, type: Number })
  Histogram: number;

  @Prop({ required: true, type: Number })
  time: number;
}

export type MACDDataDocument = MACDData & Document;
export const MACDDataSchema = SchemaFactory.createForClass(MACDData);
