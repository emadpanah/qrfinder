import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { CampaignDto } from '../../dto/campaign.dto';

@Injectable()
export class CampaignRepository {
  constructor(
    @InjectConnection('service') private connection: Connection
  ) {}

  async createCampaign(dto: CampaignDto): Promise<any> {
    const collection = this.connection.collection('_qrcampaigns');
    await collection.insertOne(dto);
    const campaign = await collection.findOne({ name: dto.name });
    if (!campaign) {
      throw new Error('Insert not completed.');
    }
    return campaign;
  }

  async findCampaignById(id: Types.ObjectId): Promise<any> {
    const collection = this.connection.collection('_qrcampaigns');
    const campaign = await collection.findOne({ _id: id });
    return campaign;
  }

  // ... add more repository methods as needed
}
