import { Injectable } from '@nestjs/common';
import { CampaignRepository } from '../database/repositories/qr-campaign.repository';
import { CampaignDto } from '../dto/campaign.dto';
import { Types } from 'mongoose';

@Injectable()
export class CampaignService {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async createCampaign(dto: CampaignDto): Promise<CampaignDto> {
    const campaign = await this.campaignRepository.createCampaign(dto);
    return campaign;
  }

  async findCampaignById(id: string): Promise<CampaignDto> {
    const objectId = new Types.ObjectId(id);
    const campaign = await this.campaignRepository.findCampaignById(objectId);
    return campaign;
  }
}