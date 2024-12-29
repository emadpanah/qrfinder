// src/modules/data/schemas/ema.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_emadata' })
export class EMAData {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, type: Number })
  ema_value: number;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: Number })
  time: number;
}

export type EMADataDocument = EMAData & Document;
export const EMADataSchema = SchemaFactory.createForClass(EMAData);
