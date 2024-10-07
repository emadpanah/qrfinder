// iam/services/iam.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IAMUser, IAMUserDocument } from '../database/schemas/iam-user.schema';
import { UserLogin } from '../database/schemas/user-login.schema';
import * as bcrypt from 'bcrypt';
import { IamRepository } from '../database/repositories/iam.repository';
import { UserLoginRepository } from '../database/repositories/user-login.repository';
import { UserDto, UserInsertDto } from '../dto/user.dto'; // Import UserDto
import { AuthService } from './auth.service';
import { TokenExpiredError } from 'jsonwebtoken';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class IamService {
  private shopInstance: AxiosInstance;
  //private readonly jwtSecret: string = process.env.JWT_SECRET || 'your-secret-key';
  private readonly tokenSecret: string;

  constructor(
    private readonly iamRepository: IamRepository,
    private readonly userLoginRepository: UserLoginRepository,
    private readonly authService: AuthService,
  ) {

    this.shopInstance = axios.create({
      baseURL: process.env.SHOP_API_DOMAIN,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    //@InjectModel(IAMUser.name) private readonly iamUserModel:
    //Model<IAMUserDocument>) {
    // Set the token secret from the environment variable
    this.tokenSecret = process.env.JWT_SECRET;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async registerOrLogin(
    dto: UserInsertDto,
  ): Promise<{ token: string; isNewToken: boolean; userId: string }> {
    try {
      if (process.env.NEXT_PUBLIC_APP_SECRET !== dto.clientSecret) {
        throw new UnauthorizedException();
      }

      // Check if the user already exists
      const user = await this.iamRepository.findUserByTelegramID(
        dto.telegramID,
      );
      if (user) {
        // User exists, check if there is a valid token
        const existingLoginInfo =
          await this.userLoginRepository.findLatestLoginByUserId(user._id);
        console.log('latestlogin - ', existingLoginInfo);
        console.log('userId - ', user._id);
        if (existingLoginInfo) {
          try {
            await this.authService.verifyJwt(existingLoginInfo.token);
            return {
              token: existingLoginInfo.token,
              isNewToken: false,
              userId: user._id,
            }; // Return existing valid token
          } catch (error) {
            if (error instanceof TokenExpiredError) {
              // Generate a new token if the existing one is expired
              const newToken = await this.authService.generateJwt(dto._id);
              await this.userLoginRepository.createLogin(dto._id, newToken);
              return { token: newToken, isNewToken: true, userId: user._id };
            } else {
              throw error; // Re-throw the error if it's not a TokenExpiredError
            }
          }
        }

        // Generate a new token if no valid token exists
        const newToken = await this.authService.generateJwt(dto._id);
        await this.userLoginRepository.createLogin(dto._id, newToken);
        return { token: newToken, isNewToken: true, userId: user._id };
      }

      // User does not exist, proceed with registration
      const newUser = await this.iamRepository.createUser(dto);

      // Generate a new token for the new user
      const token = await this.authService.generateJwt(dto._id);
      await this.userLoginRepository.createLogin(newUser._id, token);

      return { token: token, isNewToken: true, userId: newUser._id };
    } catch (error) {
      throw error;
    }
  }

  async createCustomerSync(shopId: string, bodyData: object, userId: Types.ObjectId): Promise<void> {
    const response = await this.shopInstance.post('/api/CreateCustomerSync', {
      ...bodyData,
      apiKey: process.env.SHOP_API_SECRET,
    }, {
      headers: { 'x-shop-token': shopId }
    });

    const { token: shopToken } = response.data;

    // Store shopToken in the login record
    await this.userLoginRepository.updateLoginWithShopToken(userId, shopToken);
  }

  async getUserLoginHistory(id: Types.ObjectId): Promise<UserLogin[]> {
    return this.userLoginRepository.findLoginHistoryByUserId(id);
  }

  async getShopToken(userId: string): Promise<string | null> {
    const objectIdUserId = new Types.ObjectId(userId); // Convert string userId to ObjectId
    const latestLogin = await this.userLoginRepository.findLatestLoginByUserId(objectIdUserId);
    if (latestLogin && latestLogin.shopToken) {
      return latestLogin.shopToken; // Return shopToken if available
    }
    return null; // Return null if no shopToken is found
  }

  getHello(): string {
    return 'Hello World!';
  }
}
