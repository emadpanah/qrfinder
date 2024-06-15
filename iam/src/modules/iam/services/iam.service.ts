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
import { sign } from 'jsonwebtoken';
import { verify } from 'jsonwebtoken';
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

  async registerOrLogin(dto: UserInsertDto): Promise<string> {
    try{
      console.log(process.env.NEXT_PUBLIC_APP_SECRET);
      console.log(dto.clientSecret);
      if (process.env.NEXT_PUBLIC_APP_SECRET != dto.clientSecret)
        throw new UnauthorizedException();
          console.log('register');
          // Check if the user already exists
          const user = await this.iamRepository.findUserByAddress(dto.ethAddress);
          if (user) {
            console.log('old user');
            // User exists, check if there is a valid token
            const existingLoginInfo = await this.userLoginRepository.findLatestLoginByEthAddress(dto.ethAddress);
            if (existingLoginInfo) {
              try {
                console.log('existingLoginInfo : '+ existingLoginInfo.token);
                await this.authService.verifyJwt(existingLoginInfo.token, existingLoginInfo.ethAddress);
                return existingLoginInfo.token; // Return existing valid token
              } catch (error) {
                if (error instanceof TokenExpiredError) {
                  console.log('Token expired, generating new token');
                  // Generate a new token if the existing one is expired
                  const newToken = await this.authService.generateJwt(dto.ethAddress);
                  console.log(newToken);
                  await this.userLoginRepository.createLogin(dto.ethAddress, newToken);            
                  return newToken;
                } else {
                  throw error; // Re-throw the error if it's not a TokenExpiredError
                }
              }
            }

            console.log('new token');
            // Generate a new token if no valid token exists
            const newToken = await this.authService.generateJwt(dto.ethAddress);
            await this.userLoginRepository.createLogin(dto.ethAddress, newToken);
            return newToken;
          }

          console.log('new user');
          // User does not exist, proceed with registration
          await this.iamRepository.createUser(dto);

          // Generate a new token for the new user
          const token = await this.authService.generateJwt(dto.ethAddress);
          await this.userLoginRepository.createLogin(dto.ethAddress, token);

          return token;
          
        }
    catch(error)
    {
      throw error;
    }
  }

    

  // async registerOrLogin(dto: UserInsertDto): Promise<string> {
  //   console.log('register');
  //   // Check if the user already exists
  //   const user = await this.iamRepository.findUserByAddress(dto.ethAddress);
  //   if (user) {
  //     console.log('old user');
  //     // User exists, check if there is a valid token
  //     const existingLoginInfo = await this.userLoginRepository.findLatestLoginByEthAddress(dto.ethAddress);
  //     if (existingLoginInfo && this.authService.verifyJwt(existingLoginInfo.token)) {
  //       return existingLoginInfo.token; // Return existing valid token
  //     }
      
  //     console.log('new token');
  //     // Generate a new token if no valid token exists
  //     const newToken = this.authService.generateJwt(dto.ethAddress); //sign({ ethAddress: dto.ethAddress }, this.tokenSecret, { expiresIn: '5h' });
  //     await this.userLoginRepository.createLogin(dto.ethAddress, (await newToken).toString());
  //     return newToken;
  //   }

  //   console.log('new user');
  //   // User does not exist, proceed with registration
  //   await this.iamRepository.createUser(dto);

  //   // Generate a new token for the new user
  //   const token = this.authService.generateJwt(dto.ethAddress);//sign({ ethAddress: dto.ethAddress }, this.tokenSecret, { expiresIn: '5h' });
  //   await this.userLoginRepository.createLogin(dto.ethAddress, (await token).toString());

  //   return token;
  // }

 

  async getUserLoginHistory(ethAddress: string): Promise<UserLogin[]> {
    return this.userLoginRepository.findLoginHistoryByEthAddress(ethAddress);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
