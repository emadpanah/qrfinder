// iam/services/iam.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAMUser, IAMUserDocument } from '../database/schemas/iam-user.schema';
import * as bcrypt from 'bcrypt';
import { IamRepository } from '../database/repositories/iam.repository';
import { UserDto } from '../dto/user.dto'; // Import UserDto

@Injectable()
export class IamService {
  private readonly tokenSecret: string;

  constructor(private readonly iamRepository: IamRepository){//@InjectModel(IAMUser.name) private readonly iamUserModel: Model<IAMUserDocument>) {
    // Set the token secret from the environment variable
    this.tokenSecret = process.env.JWT_SECRET;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async register(dto:UserDto): Promise<UserDto> {
    const hashedPassword = await this.hashPassword(dto.password);
    return await this.iamRepository.createUser(dto.username, hashedPassword);
  }

  async login(dto:UserDto): Promise<string> {
    const user = await this.iamRepository.findUserByUsername(dto.username);
    
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new Error('Invalid credentials');
    }
    // Use the token secret from the environment variable
    const token = this.tokenSecret;
    return token;
  }

  getHello(): string {
    return 'Hello World!';
  }
}
