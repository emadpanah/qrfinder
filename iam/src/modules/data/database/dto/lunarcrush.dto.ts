// src/modules/data/database/dto/lunarcrush.dto.ts
export class LunarCrushPublicCoinDto {
    id: number;
    symbol: string;
    name: string;
    price: number;
    price_btc: number;
    volume_24h: number;
    volatility: number;
    circulating_supply: number;
    max_supply: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    market_cap: number;
    market_cap_rank: number;
    interactions_24h: number;
    social_volume_24h: number;
    social_dominance: number;
    market_dominance: number;
    galaxy_score: number;
    galaxy_score_previous: number;
    alt_rank: number;
    alt_rank_previous: number;
    sentiment: number;
    categories: string;
    blockchains: {
      network: string;
      address: string;
      decimals: number;
    }[];
    percent_change_30d: number;
    last_updated_price: number;
    topic: string;
    logo: string;
    fetched_sort: string; 
    fetched_at: number;
  }
  