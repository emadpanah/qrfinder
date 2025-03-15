import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_st1data' })
export class ST1Data {
  @Prop()
  _id?:string;

  @Prop()
  signal: string; // Buy/Sell signal

  @Prop()
  exchange: string; // Exchange name (e.g., Binance)

  @Prop()
  symbol: string; // Cryptocurrency symbol (e.g., BTCUSDT)

  @Prop()
  price: number; // Price at the time of the signal

  @Prop()
  time: number; // UNIX timestamp for when the data was recorded

  @Prop()
  target: number;

  @Prop()
  stop: number;

  @Prop()
  isDone: boolean;
}

export type ST1DataDocument = ST1Data & Document;
export const ST1DataSchema = SchemaFactory.createForClass(ST1Data);

// Set TTL index to automatically delete documents after 30 days
ST1DataSchema.index({ time: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
