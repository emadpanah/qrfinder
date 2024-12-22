// src/modules/data/schemas/adx.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_adxdata' })
export class ADXData {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true, type: Number })
  adx_value: number;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: Number })
  time: number;
}

export type ADXDataDocument = ADXData & Document;
export const ADXDataSchema = SchemaFactory.createForClass(ADXData);
