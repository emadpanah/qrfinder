// src/modules/data/dto/rsi.dto.ts
export class RSIDto {
    symbol: string;
    RSI: number;
    time: number;
  }

  // src/modules/data/database/dto/ema.dto.ts
export class EMADto {
  symbol: string;
  ema_value: number;
  price: number;
  time: number;
}

// src/modules/data/database/dto/sma.dto.ts
export class SMADto {
  symbol: string;
  sma_value: number;
  price: number;
  time: number;
}

// src/modules/data/database/dto/stochastic.dto.ts
export class StochasticDto {
  symbol: string;
  k_value: number;
  d_value: number;
  price: number;
  time: number;
}

// src/modules/data/database/dto/cci.dto.ts
export class CCIDto {
  symbol: string;
  cci_value: number;
  price: number;
  time: number;
}
