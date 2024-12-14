import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_lunarpublicoindata' })
export class LunarCrushData {
  @Prop()
  id: number;

  @Prop()
  symbol: string;

  @Prop()
  name: string;

  @Prop()
  price: number;

  @Prop()
  price_btc: number;

  @Prop()
  volume_24h: number;

  @Prop()
  volatility: number;

  @Prop()
  circulating_supply: number;

  @Prop()
  max_supply: number;

  @Prop()
  percent_change_1h: number;

  @Prop()
  percent_change_24h: number;

  @Prop()
  percent_change_7d: number;

  @Prop()
  percent_change_30d: number;

  @Prop()
  market_cap: number;

  @Prop()
  market_cap_rank: number;

  @Prop()
  interactions_24h: number;

  @Prop()
  social_volume_24h: number;

  @Prop()
  social_dominance: number;

  @Prop()
  market_dominance: number;

  @Prop()
  galaxy_score: number;

  @Prop()
  galaxy_score_previous: number;

  @Prop()
  alt_rank: number;

  @Prop()
  alt_rank_previous: number;

  @Prop()
  sentiment: number;

  @Prop()
  categories: string;

  @Prop({ type: Array })
  blockchains: Array<{
    network: string;
    address: string;
    decimals: number;
  }>;

  @Prop()
  last_updated_price: number;

  @Prop()
  topic: string;

  @Prop()
  logo: string;

  @Prop()
  fetched_sort: string; // Sort type (e.g., price, volume_24h, etc.)

  @Prop()
  fetched_at: number; // Fetch timestamp
}

export type LunarCrushDocument = LunarCrushData & Document;
export const LunarCrushDataSchema = SchemaFactory.createForClass(LunarCrushData);
LunarCrushDataSchema.index({ categories: 1, fetched_sort: 1, fetched_at: -1 });