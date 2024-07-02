import { Injectable } from '@nestjs/common';
import { RedisRepository } from '../database/repositories/redis.repository';
import { ProductDto } from '../dto/product.dto';
import { plainToClass } from 'class-transformer';


@Injectable()
export class ProductService {
  constructor(private readonly redisRepository: RedisRepository) {}



 
//   async getProducts(): Promise<ProductDto[]> {
//     return this.redisRepository.getProducts();
//   }

async getProducts(): Promise<ProductDto[]> {
    const productsData = await this.redisRepository.getProducts();
    return productsData.map(productData => plainToClass(ProductDto, productData));
  }

}
