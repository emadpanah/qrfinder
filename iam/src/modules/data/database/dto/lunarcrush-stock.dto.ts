// src/modules/data/database/dto/lunarcrush-stock.dto.ts
export class LunarCrushPublicStockDto {
    id: number;
    symbol: string;
    name: string;
    price: number;
    volume_24h: number;
    percent_change_24h: number;
    market_cap: number;
    market_cap_rank: number;
    interactions_24h: number;
    social_volume_24h: number;
    social_dominance: number;
    market_dominance: number;
    market_dominance_prev: number;
    galaxy_score: number;
    galaxy_score_previous: number;
    alt_rank: number;
    alt_rank_previous: number;
    sentiment: number;
    categories: string;
    last_updated_price: number;
    last_updated_price_by: string;
    topic: string;
    logo: string;
    fetched_at: number;
  }
  