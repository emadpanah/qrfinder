import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const secret = process.env.JWT_SECRET;
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
  // canActivate(context: ExecutionContext): boolean {
  //   const request = context.switchToHttp().getRequest<Request>();
  //   const authHeader = request.headers['authorization'];

  //   if (!authHeader) {
  //     throw new UnauthorizedException('No token provided');
  //   }

  //   const token = authHeader.split(' ')[1];

  //   try {
  //     const decoded = this.jwtService.verifyAsync(token, { secret: process.env.NEXT_PUBLIC_APP_SECRET
  //     });
  //     request.user = decoded; // Attach the decoded user information to the request object
  //     return true;
  //   } catch (err) {
  //     throw new UnauthorizedException('Invalid token');
  //   }
  // }
}
