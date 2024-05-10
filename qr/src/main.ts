import { NestFactory } from '@nestjs/core';
import { QRModule } from './modules/qr/qr.module';

async function bootstrap() {
  const app = await NestFactory.create(QRModule);
  await app.listen(3000);
}
bootstrap();
