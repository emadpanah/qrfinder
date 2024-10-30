export class FearAndGreedDto {
    name: string;
    data: Array<{
      value: string;
      value_classification: string;
      timestamp: number;
      time_until_update?: string;
    }>;
    metadata: {
      error: any;
    };
  }
  