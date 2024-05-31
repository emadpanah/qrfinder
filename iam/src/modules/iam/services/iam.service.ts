// iam/services/iam.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAMUser, IAMUserDocument } from '../database/schemas/iam-user.schema';
import * as bcrypt from 'bcrypt';
import { IamRepository } from '../database/repositories/iam.repository';
import { UserLoginRepository } from '../database/repositories/user-login.repository';
import { UserDto } from '../dto/user.dto'; // Import UserDto
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

  async register(dto: UserDto): Promise<string> {
    // Check if the user already exists
    const existingUser = await this.iamRepository.findUserByAddress(dto.ethAddress);
    if (existingUser) {
      throw new Error('User already exists');
    }

   
    // Create the user
    await this.iamRepository.createUser(dto.ethAddress, dto.walletType);

    // Generate a new token
    const token = sign({ ethAddress: dto.ethAddress }, this.tokenSecret, { expiresIn: '5h' });
    await this.userLoginRepository.createLogin(dto.ethAddress, token);

    return token;
  }

  async login(dto: UserDto): Promise<string> {
    const user = await this.iamRepository.findUserByAddress(dto.ethAddress);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if a valid token exists
    const existingLogin = await this.userLoginRepository.findLoginByEthAddress(dto.ethAddress);
    if (existingLogin && this.isTokenValid(existingLogin.token)) {
      return existingLogin.token; // Return existing token if it's valid
    }

    // Generate a new token
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

  getHello(): string {
    return 'Hello World!';
  }
}
