// src/modules/data/schemas/cci.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_ccidata' })
export class CCIData {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, type: Number })
  cci_value: number;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: Number })
  time: number;
}

export type CCIDataDocument = CCIData & Document;
export const CCIDataSchema = SchemaFactory.createForClass(CCIData);
