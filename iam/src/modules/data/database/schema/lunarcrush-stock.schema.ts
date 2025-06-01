// src/modules/data/database/schema/lunarcrush-stock.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_lunarpublicStocksdata' })
export class LunarCrushStockData {
  @Prop() id: number;
  @Prop() symbol: string;
  @Prop() name: string;
  @Prop() price: number;
  @Prop() volume_24h: number;
  @Prop() percent_change_24h: number;
  @Prop() market_cap: number;
  @Prop() market_cap_rank: number;
  @Prop() interactions_24h: number;
  @Prop() social_volume_24h: number;
  @Prop() social_dominance: number;
  @Prop() market_dominance: number;
  @Prop() market_dominance_prev: number;
  @Prop() galaxy_score: number;
  @Prop() galaxy_score_previous: number;
  @Prop() alt_rank: number;
  @Prop() alt_rank_previous: number;
  @Prop() sentiment: number;
  @Prop() categories: string;
  @Prop() last_updated_price: number;
  @Prop() last_updated_price_by: string;
  @Prop() topic: string;
  @Prop() logo: string;
  @Prop() fetched_at: number;
}

export type LunarCrushStockDocument = LunarCrushStockData & Document;
export const LunarCrushStockSchema = SchemaFactory.createForClass(LunarCrushStockData);
