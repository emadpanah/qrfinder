import { Controller, Post, Body, Get, Query, ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { CampaignService } from '../services/qr-campaign.service';
import { CampaignDto, CampaignInsertDto } from '../dto/campaign.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('qr-campaigns')
export class CampaignController {
  private readonly logger = new Logger(CampaignController.name);

  constructor(private readonly campaignService: CampaignService) {}

  @Post('/create')
  async createCampaign(@Body(new ValidationPipe()) body: CampaignInsertDto): Promise<CampaignDto> {
    try {
      console.log("createCampaign-------------------------");
      const campaign = await this.campaignService.createCampaign(body);
      return campaign;
    } catch (error) {
      this.logger.error('Error creating campaign', error);
      throw new BadRequestException('Error creating campaign');
    }
  }

  @Get('/findbyid')
  async findCampaignById(@Query('id') id: string): Promise<CampaignDto> {
    try {
      console.log("campaignService.findCampaignById", id);
      return await this.campaignService.findCampaignById(id);
    } catch (error) {
      this.logger.error('Error finding campaign by ID', error);
      throw new BadRequestException('Error finding campaign by ID');
    }
  }

  @Get('/active')
  async findAllActiveCampaigns(): Promise<CampaignDto[]> {
    try {
      return await this.campaignService.findAllActiveCampaigns();
    } catch (error) {
      this.logger.error('Error fetching active campaigns', error);
      throw new BadRequestException('Error fetching active campaigns');
    }
  }

  @Get('/')
  async findAllCampaigns(): Promise<CampaignDto[]> {
    try {
      return await this.campaignService.findAllCampaigns();
    } catch (error) {
      this.logger.error('Error fetching all campaigns', error);
      throw new BadRequestException('Error fetching all campaigns');
    }
  }

  //@Throttle({ default: { limit: 1, ttl: 60 000 } })
  //@SkipThrottle()
  @Get('/showtest')
  async showTest(): Promise<string> {
    return "hello world";
  }

}
