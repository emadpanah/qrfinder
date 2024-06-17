import { Injectable } from '@nestjs/common';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateJwt(ethAddress: string): Promise<string> {
    return this.jwtService.sign({
      sub: ethAddress,
    });
  }

  async verifyJwt(token: string, ethAddress: string): Promise<any> {
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
