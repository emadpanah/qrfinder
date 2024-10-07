import { Injectable } from '@nestjs/common';
import { RedisRepository } from '../database/repositories/redis.repository';
import { ProductDto } from '../dto/product.dto';
import axios, { AxiosInstance } from 'axios';
import { AddToCartDto, CheckoutDto } from '../dto/shop.dto';
import { IamService } from 'src/modules/iam/services/iam.service';
import { Types } from 'mongoose';

@Injectable()
export class ProductService {
  private shopInstance: AxiosInstance;
  //private readonly iamService: IamService;
  constructor(private readonly redisRepository: RedisRepository,private readonly iamService: IamService) {
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

  // Function to fetch all products
  async getAllProducts(userId: Types.ObjectId): Promise<any> {
    const shopToken = await this.iamService.getShopToken(userId);

    if (!shopToken) {
      throw new Error('No shopToken found for this user');
    }

    console.log("shoptoken : ", shopToken);

    // Step 2: Call the external shop API to get all products
    try {
      const response = await this.shopInstance.get('/api/GetAllProducts', {
        params: {
          //langId: 'f018d2b5-71df-4d1a-9ea4-277811f71c02', //farsi lan
          langId: '763b6410-039d-43d0-83a6-3e8eb8160c9c', //En lan
          specCategoryId: 'c949fc05-1243-4fa8-80bc-a28c6d4b1665',
          pageNumber: 0,
        },
        headers: {
          'x-shop-token': process.env.NEXT_PUBLIC_SHOP_TOKEN, // Use the fetched shopToken
          Authorization: `Bearer ${shopToken}`, // Authorization token
        },
      });// Make sure to convert the observable to a promise

      console.log("products", response.data);
      return response.data;

    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }
}




