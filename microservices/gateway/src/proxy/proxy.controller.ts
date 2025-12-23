import {
    Controller, Get, Param, Req, Res, All
} from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Request, Response } from 'express';

@Controller('api')
export class ProxyController {
    constructor(private readonly proxyService: ProxyService) { }

    // Вариант 2: Использовать *path (правильный синтаксис согласно новой версии)
    @All('auth/*path')
    async proxyAuth(
        @Req() req: Request, 
        @Res() res: Response,
        @Param('path') path?: string
    ) {
        const capturedPath = path || '';
        return this.proxyService.proxyRequest('auth-service', req, res, capturedPath);
    }

    @All('mail/*path')
    async proxyMail(
        @Req() req: Request, 
        @Res() res: Response,
        @Param('path') path?: string
    ) {
        const capturedPath = path || '';
        return this.proxyService.proxyRequest('mail-service', req, res, capturedPath);
    }

    @All('user/*path')
    async proxyUser(
        @Req() req: Request, 
        @Res() res: Response,
        @Param('path') path?: string
    ) {
        const capturedPath = path || '';
        return this.proxyService.proxyRequest('user-service', req, res, capturedPath);
    }

    @All('project/*path')
    async proxyProject(
        @Req() req: Request, 
        @Res() res: Response,
        @Param('path') path?: string
    ) {
        const capturedPath = path || '';
        return this.proxyService.proxyRequest('project-service', req, res, capturedPath);
    }

    // Статический хелс-чек шлюза
    @Get('health')
    async health() {
        const services = ['auth-service', 'mail-service', 'user-service', 'project-service'];
        const checks = await Promise.all(
            services.map(service => this.proxyService.healthCheck(service))
        );

        return {
            status: checks.every(check => check.status === 'healthy') ? 'healthy' : 'degraded',
            gateway: 'healthy',
            timestamp: new Date().toISOString(),
            services: checks,
        };
    }

    @Get('health/:service')
    async serviceHealth(@Param('service') service: string) {
        const serviceName = `${service}-service`;
        return this.proxyService.healthCheck(serviceName);
    }
}