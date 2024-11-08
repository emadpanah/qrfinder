import { ObjectId } from "mongoose";

// src/modules/data/dto/tradingview-alert.dto.ts
export class TradingViewAlertDto {
    symbol: string;
    exchange: string;
    price: number;
    timestamp: number;
  }
  