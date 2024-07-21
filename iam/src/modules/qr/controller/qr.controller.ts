import { Controller, Get, Query } from '@nestjs/common';
import { QRService } from '../services/qr.service';
import { ScanDto } from '../dto/scan.dto';
import { Types } from 'mongoose';

@Controller('qr-scan')
export class QRController {
  constructor(private readonly qrService: QRService) {}

  @Get()
  async handleScan(@Query() query: ScanDto): Promise<string> {
    const { achievementId, qrIndex, userId, lat, lon } = query;
    // Convert qrIndex to a number
    const qrIndexNumber = parseInt(qrIndex, 10);
    // Ensure achievementId is a string
    const achievementIdString = new Types.ObjectId(achievementId).toString();
    return await this.qrService.processScan(achievementIdString, qrIndexNumber, userId, parseFloat(lat), parseFloat(lon));
  }
}
