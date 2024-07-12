import { Controller, Post, Body, Get, Param, ValidationPipe } from '@nestjs/common';
import { CampaignService } from '../services/qr-campaign.service';
import { CampaignDto } from '../dto/campaign.dto';
import { Logger } from '@nestjs/common';

@Controller('campaigns')
export class CampaignController {
  private readonly logger = new Logger(CampaignController.name);

  constructor(private readonly campaignService: CampaignService) {}

  @Post('/create')
  async createCampaign(@Body(new ValidationPipe()) body: CampaignDto): Promise<CampaignDto> {
    try {
      const campaign = await this.campaignService.createCampaign(body);
      return campaign;
    } catch (error) {
      this.logger.error('Error creating campaign', error);
      throw error;
    }
  }

  @Get('/:id')
  async findCampaignById(@Param('id') id: string): Promise<CampaignDto> {
    return this.campaignService.findCampaignById(id);
  }
}
