import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FngData, FngDataDocument } from '../schema/fng.schema';

@Injectable()
export class DataRepository {
  constructor(
    @InjectModel(FngData.name) private fngModel: Model<FngDataDocument>,
  ) {}

  // Save a new FNG data point in MongoDB
  async create(fngData: Partial<FngData>): Promise<FngData> {
    const newData = new this.fngModel(fngData);
    return newData.save();
  }

  // Retrieve data points for the last 15 days
  async findLast15Days(): Promise<FngData[]> {
    const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
    return this.fngModel
      .find({ timestamp: { $gte: Math.floor(fifteenDaysAgo / 1000) } })
      .sort({ timestamp: 1 })
      .exec();
  }

  // Check if a data point with a specific timestamp already exists
  async exists(timestamp: number): Promise<boolean> {
    const count = await this.fngModel.countDocuments({ timestamp }).exec();
    return count > 0;
  }
}
