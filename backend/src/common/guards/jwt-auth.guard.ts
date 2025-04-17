// src/common/guards/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
  
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
      private jwtService: JwtService,
      private reflector: Reflector, // Для проверки @Public()
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
    // Проверяем есть ли @Public() декоратор
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      
      if (isPublic) {
        return true; // Пропускаем проверку
      }
  
      const request = context.switchToHttp().getRequest();
      const token = this.extractToken(request);
      
      if (!token) {
        throw new UnauthorizedException('Токен не предоставлен');
      }
  
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });
        
        request.user = payload; // Добавляем в запрос
      } catch {
        throw new UnauthorizedException('Невалидный токен');
      }
  
      return true;
    }
  
    private extractToken(req: Request): string | undefined {
      return req.headers.authorization?.split(' ')[1]; // Bearer <token>
    }
}