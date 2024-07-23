// src/modules/qr/services/qr-campaign.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CampaignRepository } from '../database/repositories/qr-campaign.repository';
import { CampaignDto } from '../dto/campaign.dto';
import { Types } from 'mongoose';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(private readonly campaignRepository: CampaignRepository) {}

  async createCampaign(campaignDto: CampaignDto): Promise<CampaignDto> {
    const createdCampaign = await this.campaignRepository.createCampaign(campaignDto);
    return createdCampaign;
  }

  async findCampaignById(id: string): Promise<CampaignDto> {
    try {
      this.logger.log(`Finding campaign with ID: ${id}`);
      if (!Types.ObjectId.isValid(id)) {
        this.logger.error(`Invalid ID format: ${id}`);
        throw new NotFoundException(`Invalid ID format: ${id}`);
      }
      const campaign = await this.campaignRepository.findCampaignById(new Types.ObjectId(id));
      if (!campaign) {
        this.logger.error(`Campaign not found with ID: ${id}`);
        throw new NotFoundException(`Campaign not found with ID: ${id}`);
      }
      return campaign;
    } catch (error) {
      this.logger.error(`Error finding campaign by ID: ${id}`, error.stack);
      throw error;
    }
  }

  async findAllActiveCampaigns(): Promise<CampaignDto[]> {
    return this.campaignRepository.findAllActiveCampaigns();
  }

  async findAllCampaigns(): Promise<CampaignDto[]> {
    return this.campaignRepository.findAllCampaigns();
  }
}
