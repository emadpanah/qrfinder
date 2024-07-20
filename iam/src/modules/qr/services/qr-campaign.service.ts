import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CampaignRepository } from '../database/repositories/qr-campaign.repository';
import { CampaignDto } from '../dto/campaign.dto';
import { Types } from 'mongoose';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(private readonly campaignRepository: CampaignRepository) {}

  async createCampaign(dto: CampaignDto): Promise<CampaignDto> {
    const campaign = await this.campaignRepository.createCampaign(dto);
    return campaign;
  }

  async findCampaignById(id: string): Promise<CampaignDto> {
    this.logger.log(`Received ID: ${id}`);
    if (!Types.ObjectId.isValid(id)) {
      this.logger.error('Invalid campaign ID format');
      throw new BadRequestException('Invalid campaign ID format');
    }
    const objectId = new Types.ObjectId(id);
    const campaign = await this.campaignRepository.findCampaignById(objectId);
    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }
    return campaign;
  }

  async findAllActiveCampaigns(): Promise<CampaignDto[]> {
    const campaigns = await this.campaignRepository.findAllActiveCampaigns();
    return campaigns;
  }

  async findAllCampaigns(): Promise<CampaignDto[]> {
    const campaigns = await this.campaignRepository.findAllCampaigns();
    return campaigns;
  }
}
