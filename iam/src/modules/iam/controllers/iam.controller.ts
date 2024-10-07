// iam/controllers/iam.controller.ts
import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { IamService } from '../services/iam.service';
import { UserDto, UserInsertDto } from '../dto/user.dto'; // Import UserDto
import { UserLogin } from '../database/schemas/user-login.schema';
import { JwtAuthGuard } from '../guards/jwt-auth.guard'; // Import the guard
import { Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateCustomerSyncDto } from 'src/modules/product/dto/shop.dto';

@Controller('iam')
export class IamController {
  private readonly logger = new Logger(IamService.name);
  constructor(private readonly iamService: IamService) {}

  @Post('/register') // Apply the guard
  async register(
    @Body(new ValidationPipe()) body: UserInsertDto,
  ): Promise<{ token: string; isNewToken: boolean; userId: string }> {
    try {
      console.log('register : ');
      const token = await this.iamService.registerOrLogin(body);
      return {
        token: token.token,
        isNewToken: token.isNewToken,
        userId: token.userId,
      };
    } catch (error) {
      // Log the error or handle it as necessary
      throw error; // Re-throw the error for NestJS to handle
    }
  }

  @Post('/getHello')
  getHello(): string {
    return this.iamService.getHello();
  }

  @Get('/loginHistory/:id')
  @UseGuards(JwtAuthGuard) // Apply the guard
  async getUserLoginHistory(
    @Param('id') id: Types.ObjectId,
  ): Promise<UserLogin[]> {
    return this.iamService.getUserLoginHistory(id);
  }

  @Post('/create-customer-sync') // Updated endpoint
  async createCustomerSync(
    @Body() createCustomerDto: CreateCustomerSyncDto,
  ): Promise<any> {
    this.logger.log('Creating customer sync for shop ID:', createCustomerDto.shopId);
    const userId = createCustomerDto.bodyData.userId;
    // Call the service to handle customer creation and store the shopToken
    await this.iamService.createCustomerSync(createCustomerDto.shopId, createCustomerDto.bodyData, userId);

    // Return a success message without returning the token
    return { message: 'Customer created and shop token stored successfully' };
  }
  // ... other IAM-related endpoints
}
