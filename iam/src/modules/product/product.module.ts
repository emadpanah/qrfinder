import { Module } from '@nestjs/common';
import { ProductService } from '../product/services/product.service';
import { ProductController } from '../product/controllers/product.controller';
import { RedisRepository } from '../product/database/repositories/redis.repository';
import { IamModule } from '../iam/iam.module'; // Import IamModule

@Module({
  imports: [IamModule], // Import the module that provides IamService
  controllers: [ProductController],
  providers: [ProductService, RedisRepository],
  exports: [ProductService], // Export ProductService to be used in other modules
})
export class ProductModule {}