// src/modules/data/database/schema/price.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_pricedata'  })
export class PriceData {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  exchange: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  time: number; // Change time to timestamp and store as a number
}

export type PriceDataDocument = PriceData & Document;
export const PriceDataSchema = SchemaFactory.createForClass(PriceData);

// Add an index to the symbol field to improve query performance
PriceDataSchema.index({ symbol: 1 });
