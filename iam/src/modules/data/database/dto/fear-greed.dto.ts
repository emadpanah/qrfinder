export class FNGDto {    
      value: string;
      value_classification: string;
      timestamp: number;
  }
  

  export class FearAndGreedDto {
    data: Array<{
      value: string;
      value_classification: string;
      timestamp: number | string; // Allow for string or number
      time_until_update?: string;
    }>;
    metadata?: {
      error?: any;
    };
  }
  