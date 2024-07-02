import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ProductDto } from '../../../product/dto/product.dto';


@Injectable()
export class RedisRepository {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }

  async getProducts(): Promise<ProductDto[]> {
    const productData = await this.get(
    //"philippiTelegramProducts"
    "philippiget_Products_by_page_count__602f53ca0d-294c-4abc-a6f2-dbc3ef8181ec200000000"    
    );
    if (productData) {
      return JSON.parse(productData) as ProductDto[];
    }
    return [];
  }




}

