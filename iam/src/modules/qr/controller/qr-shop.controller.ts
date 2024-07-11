import { Controller, Post, Body, Get, Param, ValidationPipe } from '@nestjs/common';
import { ShopService } from '../services/qr-shop.service';
import { ShopDto, ShopInsertDto } from '../dto/shop.dto';
import { Logger } from '@nestjs/common';

@Controller('shops')
export class ShopController {
  private readonly logger = new Logger(ShopController.name);

  constructor(private readonly shopService: ShopService) {}

  @Post('/create')
  async createShop(@Body(new ValidationPipe()) body: ShopInsertDto): Promise<ShopDto> {
    try {
      const shop = await this.shopService.createShop(body);
      return shop;
    } catch (error) {
      this.logger.error('Error creating shop', error);
      throw error;
    }
  }

  @Get('/:id')
  async findShopById(@Param('id') id: string): Promise<ShopDto> {
    return this.shopService.findShopById(id);
  }
}
