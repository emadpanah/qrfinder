// iam/services/iam.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAMUser, IAMUserDocument } from '../database/schemas/iam-user.schema';
import { UserLogin } from '../database/schemas/user-login.schema';
import * as bcrypt from 'bcrypt';
import { IamRepository } from '../database/repositories/iam.repository';
import { UserLoginRepository } from '../database/repositories/user-login.repository';
import { UserDto, UserInsertDto } from '../dto/user.dto'; // Import UserDto
import { AuthService } from './auth.service';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class IamService {
  //private readonly jwtSecret: string = process.env.JWT_SECRET || 'your-secret-key';
  private readonly tokenSecret: string;

  constructor(private readonly iamRepository: IamRepository,
    private readonly userLoginRepository: UserLoginRepository, private readonly authService: AuthService){
      //@InjectModel(IAMUser.name) private readonly iamUserModel: 
      //Model<IAMUserDocument>) {
    // Set the token secret from the environment variable
    this.tokenSecret = process.env.JWT_SECRET;

  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async registerOrLogin(dto: UserInsertDto): Promise<{ token: string, isNewToken: boolean }> {
    try {
  
      if (process.env.NEXT_PUBLIC_APP_SECRET !== dto.clientSecret) {
        throw new UnauthorizedException();
      }
  
      // Check if the user already exists
      const user = await this.iamRepository.findUserByAddress(dto.address);
      if (user) {
        // User exists, check if there is a valid token
        const existingLoginInfo = await this.userLoginRepository.findLatestLoginByAddress(dto.address);
        if (existingLoginInfo) {
          try {
            await this.authService.verifyJwt(existingLoginInfo.token);
            return { token: existingLoginInfo.token, isNewToken: false }; // Return existing valid token
          } catch (error) {
            if (error instanceof TokenExpiredError) {
              // Generate a new token if the existing one is expired
              const newToken = await this.authService.generateJwt(dto.address);
              await this.userLoginRepository.createLogin(dto.address, newToken);            
              return { token: newToken, isNewToken: true };
            } else {
              throw error; // Re-throw the error if it's not a TokenExpiredError
            }
          }
        }
  
        // Generate a new token if no valid token exists
        const newToken = await this.authService.generateJwt(dto.address);
        await this.userLoginRepository.createLogin(dto.address, newToken);
        return { token: newToken, isNewToken: true };
      }
  
      // User does not exist, proceed with registration
      await this.iamRepository.createUser(dto);
  
      // Generate a new token for the new user
      const token = await this.authService.generateJwt(dto.address);
      await this.userLoginRepository.createLogin(dto.address, token);
  
      return { token: token, isNewToken: true };
    } catch (error) {
      throw error;
    }
  }
  
    

 
 

  async getUserLoginHistory(address: string): Promise<UserLogin[]> {
    return this.userLoginRepository.findLoginHistoryByAddress(address);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
