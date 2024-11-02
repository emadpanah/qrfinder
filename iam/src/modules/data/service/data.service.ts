import { Injectable } from '@nestjs/common';
import { DataRepository } from '../database/repositories/data.repository';

@Injectable()
export class DataService {
  constructor(private readonly fngRepository: DataRepository) {}

  // Retrieve the last 15 days of FNG data and perform analysis
  async getLast15DaysFngData(): Promise<any> {
    const fngData = await this.fngRepository.findLast15Days();

    // Calculate moving average for example
    const values = fngData.map((data) => parseInt(data.value, 10));
    const movingAverage = this.calculateMovingAverage(values, 12); // Example hourly moving average

    return {
      raw_data: fngData,
      moving_average: movingAverage,
    };
  }

  private calculateMovingAverage(data: number[], period: number): number[] {
    const movingAverages = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, val) => acc + val, 0);
      movingAverages.push(sum / period);
    }
    return movingAverages;
  }
}
