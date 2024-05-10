// iam/controllers/iam.controller.ts
import { Controller, Post, Body, ValidationPipe, Get } from '@nestjs/common';
import { IamService } from '../services/iam.service';
import { UserDto } from '../dto/user.dto'; // Import UserDto

@Controller('iam')
export class IamController {
  constructor(private readonly iamService: IamService) {}

  @Post('/register')
  async register(@Body() body: UserDto): Promise<UserDto> {
    try {
      const user = this.iamService.register(body);
      return user;
    } catch (error) {
      return null;
    }
  }


  @Post('/login')
  async login(@Body() body: UserDto): Promise<{ token: string }> {
   
    const token = await this.iamService.login(body);
    return { token };
  }

  @Post('/getHello')
  getHello(): string {
    return this.iamService.getHello();
  }

  // ... other IAM-related endpoints
}
