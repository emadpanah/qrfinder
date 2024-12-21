import { Injectable } from '@nestjs/common';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateJwt(id: Types.ObjectId): Promise<string> {
    const secret = this.configService.get<string>('JWT_SECRET');
    console.log("sec : ",secret)
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in the environment variables.');
    }

    return this.jwtService.sign(
      { sub: id },
      { secret } // Explicitly provide the secret
    );
  }

  async verifyJwt(token: string): Promise<any> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');

      return await this.jwtService.verifyAsync(token, {
        secret: secret,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new TokenExpiredError('jwt expired', error.expiredAt);
      } else {
        throw error;
      }
    }
  }
}
