import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProxyService {
  private readonly services: Record<string, string> = {
    'auth-service': process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
    'mail-service': process.env.MAIL_SERVICE_URL || 'http://localhost:3003',
    'user-service': process.env.USER_SERVICE_URL || 'http://localhost:3004',
    'project-service': process.env.PROJECT_SERVICE_URL || 'http://localhost:3005',
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async proxyRequest(
    serviceName: string, 
    req: Request, 
    res: Response, 
    pathParam?: string
  ): Promise<any> {
    try {
      const serviceUrl = this.services[serviceName];
      if (!serviceUrl) {
        throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
      }

      // Определяем префикс сервиса (auth, mail, user, project)
      const servicePrefix = serviceName.split('-')[0];
      
      // Формируем целевой путь
      // Если pathParam передан, используем его, иначе берем из оригинального URL
      let path = '/';
      if (pathParam !== undefined) {
        path = pathParam ? `/${pathParam}` : '/';
      } else {
        // Для совместимости: извлекаем путь из оригинального URL
        const originalUrl = req.originalUrl;
        const match = originalUrl.match(new RegExp(`^/api/${servicePrefix}(/.*)?$`));
        path = match ? (match[1] || '/') : '/';
      }

      // Убедимся, что путь всегда начинается с /
      if (!path.startsWith('/')) {
        path = `/${path}`;
      }

      const targetUrl = `${serviceUrl}/api/${servicePrefix}${path}`;
      
      // Также обрабатываем query параметры
      const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';
      const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

      console.log(`Proxying: ${req.method} ${req.originalUrl} -> ${fullUrl}`);

      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method as any,
          url: fullUrl,
          data: req.body,
          headers: {
            ...this.cleanHeaders(req.headers as Record<string, string>),
            'x-forwarded-for': req.ip,
            'x-forwarded-host': req.get('host') || '',
          },
          params: req.query,
          responseType: 'json',
        }),
      );

      // Проксируем заголовки ответа
      if (response.headers['set-cookie']) {
        res.setHeader('set-cookie', response.headers['set-cookie'] as string[]);
      }

      const headersToProxy = ['content-type', 'authorization', 'location', 'cache-control'];
      headersToProxy.forEach(header => {
        if (response.headers[header]) {
          res.setHeader(header, response.headers[header] as string);
        }
      });

      return res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error('Gateway error:', error.message);
      
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Gateway error',
        error: error.message,
        service: serviceName,
      });
    }
  }

  private cleanHeaders(headers: Record<string, string>): Record<string, string> {
    const cleaned = { ...headers };
    
    delete cleaned.host;
    delete cleaned.connection;
    delete cleaned['content-length'];
    delete cleaned['accept-encoding'];
    
    return cleaned;
  }

  async healthCheck(serviceName: string): Promise<any> {
    const serviceUrl = this.services[serviceName];
    if (!serviceUrl) {
      return {
        service: serviceName,
        status: 'unknown',
        error: 'Service not configured',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const healthUrl = `${serviceUrl}/api/health`;
      const response = await firstValueFrom(
        this.httpService.get(healthUrl, { timeout: 5000 })
      );
      return {
        service: serviceName,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        data: response.data,
      };
    } catch (error: any) {
      return {
        service: serviceName,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}