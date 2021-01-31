import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('AUTH GUARD - 1');
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
        return false;
    }
    request.user = await this.validateToken(request.headers.authorization);
    return true;
  }
  async validateToken(auth: string){
    console.log('AUTH GUARD - 2');
    if(auth.split(' ')[0] !== 'Bearer') {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    const token = auth.split(' ')[1];
    try {
        const decoded: any = await jwt.verify(token, process.env.SECRET);
        return decoded;
    }   catch (err) {
        const message = 'Token error: ' + (err.messag || err.name);
        throw new HttpException(message, HttpStatus.FORBIDDEN);
    }
  }
}