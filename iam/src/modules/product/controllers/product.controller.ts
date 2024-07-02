import { Controller, Get, Param } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ProductDto } from '../dto/product.dto';


@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts(): Promise<ProductDto[]> {
    const products = await this.productService.getProducts();
    console.log('Fetched Products:', this.formatProductsList(products));
    return products;
  }

  formatProductsList(products: ProductDto[]): string {
    return products.map(product => {
      const base = product.Base;
      return `${base.Title}: ${base.Description}`;
    }).join('\n');
}

}
