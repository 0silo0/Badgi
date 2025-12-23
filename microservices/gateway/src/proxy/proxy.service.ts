// gateway/src/proxy/proxy.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProxyService {
  private readonly services = {
    'auth-service': 'http://auth-service:3002',
    'mail-service': 'http://mail-service:3003',
    'user-service': 'http://user-service:3004',
    'project-service': 'http://project-service:3005',
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async proxyRequest(serviceName: string, req: Request, res: Response) {
    try {
      const serviceUrl = this.services[serviceName];
      if (!serviceUrl) {
        throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
      }

      // Получаем путь после названия сервиса
      const originalUrl = req.originalUrl;
      const servicePath = `/${serviceName.split('-')[0]}`; // /auth, /mail
      const path = originalUrl.replace(`/api${servicePath}`, '');
      
      const targetUrl = `${serviceUrl}/api${servicePath}${path || ''}`;

      // Проксируем запрос
      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method as any,
          url: targetUrl,
          data: req.body,
          headers: {
            ...req.headers,
            host: undefined, // Убираем оригинальный host
          },
          params: req.query,
        }),
      );

      // Проксируем куки если есть
      if (response.headers['set-cookie']) {
        res.setHeader('set-cookie', response.headers['set-cookie']);
      }

      return res.status(response.status).json(response.data);
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Gateway error',
        error: error.message,
      });
    }
  }

  async healthCheck(url: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 })
      );
      return {
        service: url.split('/')[2],
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: url.split('/')[2],
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}