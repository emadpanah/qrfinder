import { Injectable } from '@nestjs/common';
import { RedisRepository } from '../database/repositories/redis.repository';
import { ProductDto } from '../dto/product.dto';
import axios, { AxiosInstance } from 'axios';
import { AddToCartDto, CheckoutDto } from '../dto/shop.dto';

@Injectable()
export class ProductService {
  private shopInstance: AxiosInstance;
  constructor(private readonly redisRepository: RedisRepository) {
    this.shopInstance = axios.create({
      baseURL: process.env.SHOP_API_DOMAIN,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }



 
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


  async addToCart(addToCartDto: AddToCartDto): Promise<any> {
    const { customerToken, productId, count, multiValuesId, cartItemId, langId } = addToCartDto;
    return await this.shopInstance.post('/api/AddToShoppingCart', {
      productId, count, multiValuesId, cartItemId, langId
    }, {
      headers: { authorization: 'bearer ' + customerToken }
    });
  }

  async createCustomerSync(shopId: string, bodyData: object): Promise<any> {
    return await this.shopInstance.post('/api/CreateCustomerSync', bodyData, {
      headers: { 'x-shop-token': shopId }
    });
  }

  async clearUserCache(customerToken: string): Promise<void> {
    await this.shopInstance.post('/api/ClearUserCache', {}, {
      headers: { authorization: 'bearer ' + customerToken }
    });
  }

  async checkout(checkoutDto: CheckoutDto): Promise<any> {
    const { customerToken, addressId, deliveryPathId, ...rest } = checkoutDto;
    return await this.shopInstance.post('/api/CheckOut', {
      addressId, deliveryPathId, ...rest
    }, {
      headers: { authorization: 'bearer ' + customerToken }
    });
  }

  async confirmOrder(refId: string, customerToken: string): Promise<any> {
    return await this.shopInstance.post('/api/ConfirmOrder', {}, {
      params: { refId },
      headers: { authorization: 'bearer ' + customerToken }
    });
  }

  async getAllProducts(): Promise<ProductDto[]> {
    const products = await this.shopInstance.get('/api/GetAllProducts');
    return products.data as ProductDto[];
  }



}
