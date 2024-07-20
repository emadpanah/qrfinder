import { Controller, Get, Query } from '@nestjs/common';
import { QRService } from '../services/qr.service';
import { ScanDto } from '../dto/scan.dto';

@Controller('qr-scan')
export class QRController {
  constructor(private readonly qrService: QRService) {}

  @Get()
  async handleScan(@Query() query: ScanDto): Promise<string> {
    const { achievementId, qrIndex, userId, lat, lon } = query;
    return await this.qrService.processScan(achievementId, qrIndex, userId, lat, lon);
  }
}
