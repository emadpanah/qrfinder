// src/modules/data/database/dto/trade-signal.dto.ts
export type SignalSide = 'Buy' | 'Strong Buy' | 'Sell' | 'Strong Sell' | 'Hold';
export type TF = '15m' | '1h' | '4h' | '1d';
export type SignalStatus = 'open' | 'hit' | 'stopped' | 'expired';

export interface TradeSignalDto {
  _id?: string;
  symbol: string;              // e.g. BTCUSDT
  timeframe: TF;
  side: SignalSide;            // Buy / Sell / ...
  entry: number;               // price at generation time
  targets: number[];           // [T1,T2,T3] (empty if Hold)
  stop: number | null;         // null if Hold
  priceAtGen?: number;         // alias for entry (optional)
  generated_at: number;        // unix (sec)
  generated_iso: string;       // ISO string
  source: 'analyzer-v1';       // tag for the generator version
  extras?: Record<string, any>;// room for future
  // backtest fields
  status: SignalStatus;        // open|hit|stopped|expired
  hitLabel?: 'T1'|'T2'|'T3'|'SL'|null;
  hitPrice?: number|null;
  hitTime?: number|null;       // unix sec
  durationSec?: number|null;
  reached: { T1:boolean; T2:boolean; T3:boolean; SL:boolean };
}

export interface TradeSignalUpdateResultDto {
  status: SignalStatus;
  hitLabel?: 'T1'|'T2'|'T3'|'SL'|null;
  hitPrice?: number|null;
  hitTime?: number|null;
  durationSec?: number|null;
  reached: { T1:boolean; T2:boolean; T3:boolean; SL:boolean };
}
