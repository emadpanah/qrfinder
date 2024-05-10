// qr.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { QRService } from './qr.service';
import { hashClientSecret } from '../../../shared/utils/hash.utils';
import fs from 'fs';
import path from 'path';

describe('QRService', () => {
  let qrService: QRService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QRService],
    }).compile();

    qrService = module.get<QRService>(QRService);
  });

  describe('generateQRCode', () => {
    it('should generate a QR code from a provided link and save it in assets/qr-imgs folder', async () => {
      const link = 'https://www.fuckyou.com';

      await qrService.generateQRCode(link);

      // Add your assertions here based on your implementation
      // For example, you might check that the file exists with the expected hash in the name.

      const hash = await hashClientSecret(link);
      const qrCodePath = path.join(__dirname, '../../../../assets/qr-imgs', `qrcode_${hash}.png`);

      console.log(qrCodePath);
      // Ensure that the generated QR code file exists
      expect(fs.existsSync(qrCodePath)).toBe(true);

      // Optionally, you can add more assertions based on your specific requirements.
    });
  });

  // Add more test cases for other methods if needed

  afterAll(() => {
    // Add cleanup logic if necessary
  });
});
