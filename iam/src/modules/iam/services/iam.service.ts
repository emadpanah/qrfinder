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
import { getOS } from 'mongodb-memory-server-core/lib/util/getos';
import { Chat } from 'openai/resources';
import { sanitizeString } from 'src/shared/helper';

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

  async updateUser(user: UserDto): Promise<UserDto> {
    try {
      const ret = await this.iamRepository.updateUser(user.telegramID, user.telegramUserName, user.mobile);
      return ret;
    } catch (error) {
      throw error;
    }
  }
  async getUser(userId: Types.ObjectId): Promise<UserDto> {
    try {
      //const obj = new Types.ObjectId(userId);
      let user = await this.iamRepository.findUserById(userId);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async setUserAlias(telegramID: string, alias: string): Promise<any> {
    try {
      const ret = await this.iamRepository.setUserAlias(telegramID, alias);
      return ret;
    } catch (error) {
      console.log('Error setting user alias:', error);
      throw new Error('Failed to set user alias.');
    }
  }

  async registerOrLogin(
    dto: UserInsertDto,
  ): Promise<{ token: string; isNewToken: boolean; userId: string, alias: string }> {
    try {
      console.log('registering started ');

      if (process.env.NEXT_PUBLIC_APP_SECRET !== dto.clientSecret) {
        throw new UnauthorizedException();
      }

      console.log('findUserByTelegramID - ', dto.telegramID);
      // Check if the user already exists
      let user = await this.iamRepository.findUserByTelegramID(dto.telegramID);
      if (user) {
        // User exists, check if there is a valid token
        if (
          user.telegramUserName != dto.telegramUserName ||
          (user.mobile != dto.mobile && dto.mobile != '')
        ) {
          //console.log("updating .....");
          user = await this.iamRepository
            .updateUser(user.telegramID, dto.telegramUserName, dto.mobile);
        }
        //console.log('user updated - ', user);
        const existingLoginInfo =
          await this.userLoginRepository.findLatestLoginByUserId(user._id);
        //console.log('latestlogin - ', existingLoginInfo);
       // console.log('userId - ', user._id);
        if (existingLoginInfo) {
          try {
            await this.authService.verifyJwt(existingLoginInfo.token);
            return {
              token: existingLoginInfo.token,
              isNewToken: false,
              userId: user._id,
              alias: user.alias
            }; // Return existing valid token
          } catch (error) {
            if (error instanceof TokenExpiredError) {
              // Generate a new token if the existing one is expired
              const newToken = await this.authService.generateJwt(user._id);
              await this.userLoginRepository.createLogin(user._id, newToken, dto.chatId);
              return { token: newToken, isNewToken: true, userId: user._id, alias: user.alias };
            } else {
              throw error; // Re-throw the error if it's not a TokenExpiredError
            }
          }
        }

        // Generate a new token if no valid token exists
        //console.log('Generate a new token', user._id);
        const newToken = await this.authService.generateJwt(user._id);
        //console.log('Generate a new token', newToken);
        await this.userLoginRepository.createLogin(user._id, newToken, dto.chatId);
        return { token: newToken, isNewToken: true, userId: user._id, alias: user.alias };
      }

      // User does not exist, proceed with registration
      const newUser = await this.iamRepository.createUser(dto);

      // Generate a new token for the new user
      const token = await this.authService.generateJwt(newUser._id);
      await this.userLoginRepository.createLogin(newUser._id, token, dto.chatId);

      return { token: token, isNewToken: true, userId: newUser._id, alias: newUser.alias };
    } catch (error) {
      throw error;
    }
  }

  async createCustomerSync(
    shopId: string,
    bodyData: object,
    userId: Types.ObjectId,
  ): Promise<void> {
    const response = await this.shopInstance.post(
      '/api/CreateCustomerSync',
      {
        ...bodyData,
        apiKey: process.env.SHOP_API_SECRET,
      },
      {
        headers: { 'x-shop-token': shopId },
      },
    );

    const { token: shopToken } = response.data;

    console.log('shopToken : -- : ', shopToken);

    // Store shopToken in the login record
    await this.userLoginRepository.updateLoginWithShopToken(userId, shopToken);
  }

  async getUserLoginHistory(id: Types.ObjectId): Promise<UserLogin[]> {
    return this.userLoginRepository.findLoginHistoryByUserId(id);
  }

  async getShopToken(userId: Types.ObjectId): Promise<string | null> {
    const objectIdUserId = new Types.ObjectId(userId); // Convert string userId to ObjectId
    const latestLogin =
      await this.userLoginRepository.findLatestLoginByUserId(objectIdUserId);
    if (latestLogin && latestLogin.shopToken) {
      return latestLogin.shopToken; // Return shopToken if available
    }
    return null; // Return null if no shopToken is found
  }

  async findLatestLoginByTelegramId(telegramID: string): Promise<{ chatId: string } | null> {
    // Get user by telegramID first
    const user = await this.iamRepository.findUserByTelegramID(telegramID);
    if (!user) return null;
  
    // Then get latest login record by userId
    const latestLogin = await this.userLoginRepository.findLatestLoginByUserId(user._id);
    if (latestLogin && latestLogin.chatId) {
      return { chatId: latestLogin.chatId };
    }
    return null;
  }
  
  async getLastNUsers(n: number): Promise<UserDto[]> {
    return this.iamRepository.findLastNUsers(n);
  }
  
  async findUsersWithMinChatCount(minChats: number, limit: number): Promise<any[]> {
    return await this.iamRepository.findUsersWithMinChatCount(minChats, limit);
  }
  

  async findUserByTelegramID(telegramId: string): Promise<UserDto> {
    return this.iamRepository.findUserByTelegramID(telegramId);
  }

  async getExpiredUsers(n: number): Promise<any[]> {
    const expiredUserIds = await this.iamRepository.findExpiredUsers(n);
    
    return expiredUserIds;
  }

  async getTopDepositUsers(n: number): Promise<any[]> {
    return await this.iamRepository.findUsersWithTopDeposits(n);
  }
  
  async expireUser(telegramId: string): Promise<boolean> {
    const user = await this.iamRepository.findUserByTelegramID(telegramId);
    if (!user || !user._id) {
      throw new Error(`User not found with telegramId: ${telegramId}`);
    }
    return this.iamRepository.expireUser(user._id);
  }
  
  

  getHello(): string {
    return 'Hello World!';
  }
}
