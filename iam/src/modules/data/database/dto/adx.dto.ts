// src/modules/data/dto/adx.dto.ts
export class ADXDto {
    symbol: string;
    status: string; // 'strong_trend' or 'weak_trend'
    adx_value: number;
    price: number;
    time: number;
  }
  