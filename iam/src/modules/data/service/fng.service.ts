import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataRepository } from '../database/repositories/data.repository';
import { lastValueFrom } from 'rxjs';
import { FearAndGreedDto } from '../database/dto/fear-greed.dto';

@Injectable()
export class FngService {
  private readonly API_URL = 'https://api.alternative.me/fng/?limit=1';

  constructor(
    private readonly httpService: HttpService,
    private readonly fngRepository: DataRepository,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchAndStoreFngData() {
    try {
      const response = await lastValueFrom(
        this.httpService.get<FearAndGreedDto>(this.API_URL),
      );

      const fngData = response.data.data[0];

      // Check if data with this timestamp already exists
      const exists = await this.fngRepository.exists(fngData.timestamp);
      if (exists) {
        console.log(
          `Data for timestamp ${fngData.timestamp} already exists. Skipping.`,
        );
        return;
      }

      // Store new data in MongoDB
      await this.fngRepository.create({
        value: fngData.value,
        value_classification: fngData.value_classification,
        timestamp: fngData.timestamp,
      });

      console.log(`Stored FNG data for timestamp ${fngData.timestamp}`);
    } catch (error) {
      console.error('Error fetching FNG data:', error);
    }
  }
}
