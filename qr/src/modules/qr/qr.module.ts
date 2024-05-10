import { Module } from '@nestjs/common';
import { QRController } from '../qr/controllers/qr.controller';
import { QRService } from './services/qr.service';

@Module({
  imports: [],
  controllers: [QRController],
  providers: [QRService],
})
export class QRModule {}
