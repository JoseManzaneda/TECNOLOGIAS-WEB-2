import {
  Controller,
  All,
  Req,
  Res,
  Get,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GatewayService } from './gateway.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  /**
   * Health check del gateway
   */
  @Get('health')
  async health() {
    return {
      status: 'ok',
      service: 'API Gateway',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Health check de todos los microservicios
   */
  @Get('health/all')
  async healthAll() {
    return this.gatewayService.checkAllServicesHealth();
  }

  /**
   * Información de servicios disponibles
   */
  @Get('services')
  getServices() {
    return {
      services: this.gatewayService.getServicesConfig(),
      gateway: {
        version: '1.0.0',
        uptime: process.uptime(),
      },
    };
  }

  /**
   * Proxy para Auth Service
   */
  @All('auth/*')
  async proxyAuth(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/gateway/auth', '');
    
    const result = await this.gatewayService.proxyRequest(
      'auth',
      path,
      req.method,
      req.body,
      req.headers as Record<string, string>,
      req.query,
    );

    return res.status(HttpStatus.OK).json(result);
  }

  /**
   * Proxy para Users Service (requiere autenticación)
   */
  @All('users/*')
  @UseGuards(JwtAuthGuard)
  async proxyUsers(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/gateway/users', '');
    
    const result = await this.gatewayService.proxyRequest(
      'users',
      path,
      req.method,
      req.body,
      req.headers as Record<string, string>,
      req.query,
    );

    return res.status(HttpStatus.OK).json(result);
  }

  /**
   * Proxy para Products Service
   */
  @All('products/*')
  async proxyProducts(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/gateway/products', '');
    
    const result = await this.gatewayService.proxyRequest(
      'products',
      path,
      req.method,
      req.body,
      req.headers as Record<string, string>,
      req.query,
    );

    return res.status(HttpStatus.OK).json(result);
  }

  /**
   * Proxy para Orders Service (requiere autenticación)
   */
  @All('orders/*')
  @UseGuards(JwtAuthGuard)
  async proxyOrders(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/gateway/orders', '');
    
    const result = await this.gatewayService.proxyRequest(
      'orders',
      path,
      req.method,
      req.body,
      req.headers as Record<string, string>,
      req.query,
    );

    return res.status(HttpStatus.OK).json(result);
  }

  /**
   * Proxy para Customer Service (requiere autenticación)
   */
  @All('customer/*')
  @UseGuards(JwtAuthGuard)
  async proxyCustomer(@Req() req: Request, @Res() res: Response) {
    const path = req.url.replace('/gateway/customer', '');
    
    const result = await this.gatewayService.proxyRequest(
      'customer',
      path,
      req.method,
      req.body,
      req.headers as Record<string, string>,
      req.query,
    );

    return res.status(HttpStatus.OK).json(result);
  }
}
