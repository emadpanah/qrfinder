// iam/controllers/iam.controller.ts
import { Controller, Post, Body, ValidationPipe, Get, Param, UseGuards } from '@nestjs/common';
import { IamService } from '../services/iam.service';
import { UserDto, UserInsertDto} from '../dto/user.dto'; // Import UserDto
import { UserLogin } from '../database/schemas/user-login.schema'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'; // Import the guard
import { Logger } from '@nestjs/common';

@Controller('iam')
export class IamController {
  private readonly logger = new Logger(IamService.name);
  constructor(private readonly iamService: IamService) {}

  @Post('/register') // Apply the guard
  async register(@Body(new ValidationPipe()) body: UserInsertDto): Promise<{ token: string, isNewToken: boolean }> {
    try {
      console.log("register : ");
      const token = await this.iamService.registerOrLogin(body);
      return { token: token.token, isNewToken: token.isNewToken };
    } catch (error) {
      // Log the error or handle it as necessary
      throw error; // Re-throw the error for NestJS to handle
    }
  }


  @Post('/getHello')
  getHello(): string {
    return this.iamService.getHello();
  }

  @Get('/loginHistory/:address')
  @UseGuards(JwtAuthGuard) // Apply the guard
  async getUserLoginHistory(@Param('address') address: string): Promise<UserLogin[]> {
    return this.iamService.getUserLoginHistory(address);
  }
  // ... other IAM-related endpoints
}
