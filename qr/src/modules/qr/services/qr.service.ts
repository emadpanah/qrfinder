
// qr.service.ts
import { hashClientSecret } from '../../../shared/utils/hash.utils';
import { Injectable } from '@nestjs/common';
import qrImage from 'qr-image';
import fs from 'fs';
import path from 'path';

@Injectable()
export class QRService {
  async generateQRCode(link: string): Promise<void> {
    const hash = await hashClientSecret(link); // Hashing the link as an example
    const qrCodePath = path.join(__dirname, '../../../../assets/qr-imgs', `qrcode_${hash}.png`);

    const qrCode = qrImage.image(link, { type: 'png' });
    qrCode.pipe(fs.createWriteStream(qrCodePath));

    // Optionally, you can return the file path or any other relevant information.
    // return qrCodePath;
  }

  getHello(): string {
    return 'Hello QR World!';
  }
}
