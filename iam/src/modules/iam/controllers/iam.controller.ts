// iam/controllers/iam.controller.ts
import { Controller, Post, Body, ValidationPipe, Get } from '@nestjs/common';
import { IamService } from '../services/iam.service';
import { UserDto } from '../dto/user.dto'; // Import UserDto
import { IAMUser } from '../database/schemas/iam-user.schema';

@Controller('iam')
export class IamController {
  constructor(private readonly iamService: IamService) {}

  @Post('/register')
  async register(@Body(new ValidationPipe()) body: UserDto): Promise<{ token: string }> {
    try {
      const token = await this.iamService.register(body);
      return {token};
    } catch (error) {
      // Log the error or handle it as necessary
      throw error; // Re-throw the error for NestJS to handle
    }
  }

  @Post('/login')
  async login(@Body(new ValidationPipe()) body: UserDto): Promise<{ token: string }> {
    try {
      const token = await this.iamService.login(body);
      return { token };
    } catch (error) {
      // Log the error or handle it as necessary
      throw error; // Re-throw the error for NestJS to handle
    }
  }

  @Post('/getHello')
  getHello(): string {
    return this.iamService.getHello();
  }

  // ... other IAM-related endpoints
}
