import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { ShopInsertDto } from '../../dto/shop.dto';

@Injectable()
export class ShopRepository {
  constructor(
    @InjectConnection('service') private connection: Connection
  ) {}

  async createShop(dto: ShopInsertDto): Promise<any> {
    const collection = this.connection.collection('_qrshops');
    await collection.insertOne(dto);
    const shop = await collection.findOne({ name: dto.name });
    if (!shop) {
      throw new Error('Insert not completed.');
    }
    return shop;
  }

  async findShopById(id: Types.ObjectId): Promise<any> {
    const collection = this.connection.collection('_qrshops');
    const shop = await collection.findOne({ _id: id });
    return shop;
  }

  // ... add more repository methods as needed
}
