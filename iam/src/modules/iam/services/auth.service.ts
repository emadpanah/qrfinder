import { Injectable } from '@nestjs/common';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {}

  async generateJwt(ethAddress: string): Promise<string> {
    console.log(process.env.JWT_SECRET);
    const secret = this.configService.get<string>('JWT_SECRET');
    const payload = {
        sub: ethAddress,
        iat: Math.floor(Date.now() / 1000), // Issued at time
      };
      return this.jwtService.sign(payload,{secret: secret,
        expiresIn: '120s',});
  }

  async verifyJwt(token: string, ethAddress: string): Promise<any> {
    try {
        const secret = this.configService.get<string>('JWT_SECRET');
        console.log('verifyJwt : '+secret);
        //return this.jwtService.verify(token, {secret});
        
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
