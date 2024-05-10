import { Controller, Get } from '@nestjs/common';
import { QRService } from '../services/qr.service';

@Controller()
export class QRController {
  constructor(private readonly appService: QRService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
