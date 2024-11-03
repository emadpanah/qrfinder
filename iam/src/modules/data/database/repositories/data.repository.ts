import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { FngData } from '../schema/fng.schema';

@Injectable()
export class DataRepository {
  private readonly collectionName = '_fngdata';

  constructor(@InjectConnection('service') private readonly connection: Connection) {}

  // Save a new FNG data point in MongoDB
  async create(fngData: Partial<FngData>): Promise<FngData> {
    const collection = this.connection.collection(this.collectionName);
    await collection.insertOne(fngData);
    return fngData as FngData;
  }

  // Retrieve data points for the last 15 days
  async findLast15Days(): Promise<FngData[]> {
    const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
    const collection = this.connection.collection(this.collectionName);

    const results = await collection
      .find({ timestamp: { $gte: Math.floor(fifteenDaysAgo / 1000) } })
      .sort({ timestamp: 1 })
      .toArray();

    // Convert the results to unknown first, then map them to FngData
    return (results as unknown as Array<Partial<FngData>>).map((result) => ({
      name: result.name ?? 'Unknown', // Provide default values if necessary
      value: result.value ?? '0',
      value_classification: result.value_classification ?? 'Neutral',
      timestamp: result.timestamp ?? 0,
      metadata: result.metadata ?? {},
    })) as FngData[];
  }

  // Check if a data point with a specific timestamp already exists
  async exists(timestamp: number): Promise<boolean> {
    const collection = this.connection.collection(this.collectionName);
    const count = await collection.countDocuments({ timestamp });
    return count > 0;
  }
}
