import { Controller, Get, Logger } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ProductDto } from '../dto/product.dto';


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

}
