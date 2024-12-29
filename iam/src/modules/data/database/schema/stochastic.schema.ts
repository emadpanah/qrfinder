// src/modules/data/schemas/stochastic.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_stochasticdata' })
export class StochasticData {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, type: Number })
  k_value: number;

  @Prop({ required: true, type: Number })
  d_value: number;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: Number })
  time: number;
}

export type StochasticDataDocument = StochasticData & Document;
export const StochasticDataSchema = SchemaFactory.createForClass(StochasticData);
