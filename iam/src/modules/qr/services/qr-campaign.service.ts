// src/modules/qr/services/qr-campaign.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign, CampaignDocument } from '../database/schemas/qr-campaign.schema';
import { CampaignDto } from '../dto/campaign.dto';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(@InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>) {}

  async createCampaign(campaignDto: CampaignDto): Promise<CampaignDto> {
    const createdCampaign = new this.campaignModel(campaignDto);
    return createdCampaign.save();
  }

  async findCampaignById(id: string): Promise<CampaignDto> {
    try {
      this.logger.log(`Finding campaign with ID: ${id}`);
      if (!Types.ObjectId.isValid(id)) {
        this.logger.error(`Invalid ID format: ${id}`);
        throw new NotFoundException(`Invalid ID format: ${id}`);
      }
      const campaign = await this.campaignModel.findById(id).exec();
      if (!campaign) {
        this.logger.error(`Campaign not found with ID: ${id}`);
        throw new NotFoundException(`Campaign not found with ID: ${id}`);
      }
      return campaign.toObject() as CampaignDto;
    } catch (error) {
      this.logger.error(`Error finding campaign by ID: ${id}`, error.stack);
      throw error;
    }
  }

  async findAllActiveCampaigns(): Promise<CampaignDto[]> {
    const now = new Date();
    return this.campaignModel.find({ expirationDate: { $gt: now } }).exec();
  }

  async findAllCampaigns(): Promise<CampaignDto[]> {
    return this.campaignModel.find().exec();
  }
}
