// src/modules/data/schemas/sma.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_smadata' })
export class SMAData {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, type: Number })
  sma_value: number;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: Number })
  time: number;
}

export type SMADataDocument = SMAData & Document;
export const SMADataSchema = SchemaFactory.createForClass(SMAData);
