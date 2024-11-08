import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataRepository } from '../database/repositories/data.repository';
import axios, { AxiosInstance } from 'axios';
import { FearAndGreedDto } from '../database/dto/fear-greed.dto';

@Injectable()
export class FngService {
  private axiosInstance: AxiosInstance;

  constructor(private readonly fngRepository: DataRepository) {
    console.log('FngService initialized');
    this.axiosInstance = axios.create({
      baseURL: 'https://api.alternative.me',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Fetch and store FNG data every minute
  @Cron('* * * * *')
  //@Cron('*/10 * * * * *') // This runs every 10 seconds
  async fetchAndStoreFngData() {
    try {
      // Fetch data from the Fear and Greed Index API
      const response = await this.axiosInstance.get<FearAndGreedDto>('/fng/?limit=1');
      const fngData = response.data.data[0];

       // Convert timestamp to a number if it’s a string
    const timestamp = typeof fngData.timestamp === 'string' ? parseInt(fngData.timestamp, 10) : fngData.timestamp;

      // Check if data with this timestamp already exists to avoid duplicates
      const exists = await this.fngRepository.existsFng(timestamp);
      if (exists) {
        console.log(`Data for timestamp ${fngData.timestamp}, ${fngData.value} already exists. Skipping.`);
        return;
      }

      // Store new data in MongoDB
      await this.fngRepository.create({
        value: fngData.value,
        value_classification: fngData.value_classification,
        timestamp: timestamp,
      });

      console.log(`Stored FNG data for timestamp ${fngData.timestamp}`);
    } catch (error) {
      console.error('Error fetching FNG data:', error.message);
    }
  }
}
