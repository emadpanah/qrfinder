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
  async register(@Body(new ValidationPipe()) body: UserInsertDto): Promise<{ token: string }> {
    try {
      this.logger.log(`Attempting to register or login user with address:`);
      const token = await this.iamService.registerOrLogin(body);
      return {token};
    } catch (error) {
      // Log the error or handle it as necessary
      throw error; // Re-throw the error for NestJS to handle
    }
  }


  @Post('/getHello')
  getHello(): string {
    return this.iamService.getHello();
  }

  @Get('/loginHistory/:ethAddress')
  @UseGuards(JwtAuthGuard) // Apply the guard
  async getUserLoginHistory(@Param('ethAddress') ethAddress: string): Promise<UserLogin[]> {
    return this.iamService.getUserLoginHistory(ethAddress);
  }
  // ... other IAM-related endpoints
}
