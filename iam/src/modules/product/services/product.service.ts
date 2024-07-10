import { Injectable } from '@nestjs/common';
import { RedisRepository } from '../database/repositories/redis.repository';
import { ProductDto } from '../dto/product.dto';


@Injectable()
export class ProductService {
  constructor(private readonly redisRepository: RedisRepository) {}



 
//   async getProducts(): Promise<ProductDto[]> {
//     return this.redisRepository.getProducts();
//   }

async getProducts(): Promise<string> {
    const productsData = await this.redisRepository.getProducts();
    return this.formatProductsList(productsData);
  }

  formatProductsList(products: ProductDto[]): string {
    return products.map(product => {
      const base = product.Base;
      return `${base.Title}: ${base.Description} : ${product.SmallImage}`+
      `${base.Quantity}: ${product.CatalogsString} : ${product.TagsString}`+
      `${product.SuperSpecsAndSelectedValues}: ${product.CurrentSuperValues} : ${product.ValuePriceStorages}`;
    }).join('\n');
  }

  async saveMessage(message: any): Promise<any> {
    // Implement your logic to save the message to the database
    // Example: Use your repository to save the message
    console.log(message);
    return; // Replace with actual saving logic
  }

}
