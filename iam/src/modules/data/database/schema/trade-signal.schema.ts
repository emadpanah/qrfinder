
// src/modules/data/database/schema/trade-signal.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false, collection: '_tradesignals' })
export class TradeSignal {
  @Prop({ required: true }) symbol: string;
  @Prop({ required: true, enum: ['15m','1h','4h','1d'] }) timeframe: string;
  @Prop({ required: true, enum: ['Buy','Strong Buy','Sell','Strong Sell','Hold'] }) side: string;

  @Prop({ required: true }) entry: number;
  @Prop({ type: [Number], default: [] }) targets: number[];
  @Prop({ type: Number, default: null }) stop: number | null;

  @Prop({ required: true }) generated_at: number; // unix sec
  @Prop({ required: true }) generated_iso: string;

  @Prop({ default: 'analyzer-v1' }) source: string;
  @Prop({ type: Object }) extras: Record<string, any>;

  // backtest
  @Prop({ required: true, enum: ['open','hit','stopped','expired'], default: 'open' }) status: string;
  @Prop({ type: String, enum: ['T1','T2','T3','SL', null], default: null }) hitLabel: 'T1'|'T2'|'T3'|'SL'|null;
  @Prop({ type: Number, default: null }) hitPrice: number|null;
  @Prop({ type: Number, default: null }) hitTime: number|null;
  @Prop({ type: Number, default: null }) durationSec: number|null;
  @Prop({ type: Object, default: { T1:false, T2:false, T3:false, SL:false } })
  reached: { T1:boolean; T2:boolean; T3:boolean; SL:boolean };
}

export type TradeSignalDocument = TradeSignal & Document;
export const TradeSignalSchema = SchemaFactory.createForClass(TradeSignal);

// Helpful indexes
TradeSignalSchema.index({ symbol: 1, generated_at: -1 });
TradeSignalSchema.index({ status: 1, symbol: 1 });
TradeSignalSchema.index({ timeframe: 1, generated_at: -1 });
