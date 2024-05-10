import { Test, TestingModule } from '@nestjs/testing';
import { QRController } from './qr.controller';
import { QRService } from '../services/qr.service';

describe('QRController', () => {
  let qrController: QRController;
  let qrService: QRService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QRController],
      providers: [QRService],
    }).compile();

    qrController = module.get<QRController>(QRController);
    qrService = module.get<QRService>(QRService);
  });

  describe('getHello', () => {
    it('should return the string from QRService', () => {
      const mockString = 'Hello World!'; // You can modify this based on your service behavior

      jest.spyOn(qrService, 'getHello').mockReturnValue(mockString);

      expect(qrController.getHello()).toBe(mockString);
    });
  });
});
