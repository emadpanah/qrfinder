// iam/services/iam.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAMUser, IAMUserDocument } from '../database/schemas/iam-user.schema';
import { UserLogin } from '../database/schemas/user-login.schema';
import * as bcrypt from 'bcrypt';
import { IamRepository } from '../database/repositories/iam.repository';
import { UserLoginRepository } from '../database/repositories/user-login.repository';
import { UserDto, UserInsertDto } from '../dto/user.dto'; // Import UserDto
import { sign } from 'jsonwebtoken';
import { verify } from 'jsonwebtoken';

@Injectable()
export class IamService {
  //private readonly jwtSecret: string = process.env.JWT_SECRET || 'your-secret-key';
  private readonly tokenSecret: string;

  constructor(private readonly iamRepository: IamRepository,
    private readonly userLoginRepository: UserLoginRepository){//@InjectModel(IAMUser.name) private readonly iamUserModel: Model<IAMUserDocument>) {
    // Set the token secret from the environment variable
    this.tokenSecret = process.env.JWT_SECRET;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async registerOrLogin(dto: UserInsertDto): Promise<string> {
    // Check if the user already exists
    const user = await this.iamRepository.findUserByAddress(dto.ethAddress);
    if (user) {
      // User exists, check if there is a valid token
      const existingLoginInfo = await this.userLoginRepository.findLatestLoginByEthAddress(dto.ethAddress);
      if (existingLoginInfo && this.isTokenValid(existingLoginInfo.token)) {
        return existingLoginInfo.token; // Return existing valid token
      }

      // Generate a new token if no valid token exists
      const newToken = sign({ ethAddress: dto.ethAddress }, this.tokenSecret, { expiresIn: '5h' });
      await this.userLoginRepository.createLogin(dto.ethAddress, newToken);
      return newToken;
    }

    // User does not exist, proceed with registration
    await this.iamRepository.createUser(dto);

    // Generate a new token for the new user
    const token = sign({ ethAddress: dto.ethAddress }, this.tokenSecret, { expiresIn: '5h' });
    await this.userLoginRepository.createLogin(dto.ethAddress, token);

    return token;
  }

  // Helper method to check if a token is valid
  private isTokenValid(token: string): boolean {
    try {
      verify(token, this.tokenSecret);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getUserLoginHistory(ethAddress: string): Promise<UserLogin[]> {
    return this.userLoginRepository.findLoginHistoryByEthAddress(ethAddress);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
