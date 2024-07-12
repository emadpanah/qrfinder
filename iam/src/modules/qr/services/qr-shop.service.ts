import { Injectable } from '@nestjs/common';
import { ShopRepository } from '../database/repositories/qr-shop.repository';
import { ShopDto } from '../dto/shop.dto';
import { Types } from 'mongoose';

@Injectable()
export class ShopService {
  constructor(private readonly shopRepository: ShopRepository) {}

  async createShop(dto: ShopDto): Promise<ShopDto> {
    const shop = await this.shopRepository.createShop(dto);
    return shop;
  }

  async findShopById(id: string): Promise<ShopDto> {
    const objectId = new Types.ObjectId(id);
    const shop = await this.shopRepository.findShopById(objectId);
    return shop;
  }
}
