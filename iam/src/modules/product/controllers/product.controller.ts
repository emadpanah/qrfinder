import { Controller, Get, Post, Logger, Body } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ProductDto } from '../dto/product.dto';
import { AddToCartDto, CheckoutDto, ConfirmOrderDto, CreateCustomerSyncDto } from '../dto/shop.dto';


@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  private readonly logger = new Logger(ProductController.name);
  @Get()
  async getProducts(): Promise<string> {
    const products = await this.productService.getProducts();
    console.log('Fetched Products:', products);
    this.logger.log('Sending prompt to ChatGPT:',  products);
    return products;
  }

  formatProductsList(products: ProductDto[]): string {
    return products.map(product => {
      const base = product.Base;
      return `${base.Title}: ${base.Description} : ${product.SmallImage}`+
      `${base.Quantity}: ${product.CatalogsString} : ${product.TagsString}`+
      `${product.SuperSpecsAndSelectedValues}: ${product.CurrentSuperValues} : ${product.ValuePriceStorages}`;
    }).join('\n');
  }

  @Post('create-customer-sync')
  async createCustomerSync(@Body() createCustomerDto: CreateCustomerSyncDto): Promise<any> {
    this.logger.log('Creating customer sync - - ', createCustomerDto.shopId);
    return this.productService.createCustomerSync(createCustomerDto.shopId, createCustomerDto.bodyData);
  }

  @Post('add-to-cart')
  async addToCart(@Body() addToCartDto: AddToCartDto): Promise<any> {
    this.logger.log('Adding product to cart');
    return this.productService.addToCart(addToCartDto);
  }

  @Post('checkout')
  async checkout(@Body() checkoutDto: CheckoutDto): Promise<any> {
    this.logger.log('Processing checkout');
    return this.productService.checkout(checkoutDto);
  }

  @Get('all-products')
  async getAllProducts(): Promise<string> {
    const products = await this.productService.getAllProducts();
    this.logger.log('Fetched Products:', products);
    return this.productService.formatProductsList(products);
  }

}
