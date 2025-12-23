// gateway/src/proxy/proxy.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Req, Res, UseInterceptors } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Request, Response } from 'express';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('auth/:path*')
  async proxyAuth(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest('auth-service', req, res);
  }

  @Post('auth/:path*')
  async proxyAuthPost(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest('auth-service', req, res);
  }

  @Get('mail/:path*')
  async proxyMail(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest('mail-service', req, res);
  }

  @Post('mail/:path*')
  async proxyMailPost(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest('mail-service', req, res);
  }

  // Health checks
  @Get('health/auth')
  async authHealth() {
    return this.proxyService.healthCheck('http://auth-service:3002/api/auth/health');
  }

  @Get('health/mail')
  async mailHealth() {
    return this.proxyService.healthCheck('http://mail-service:3003/api/mail/health');
  }
}