import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

export interface ServiceRoute {
  name: string;
  baseUrl: string;
  healthEndpoint: string;
}

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  // Configuración de rutas de microservicios
  private readonly services: Record<string, ServiceRoute> = {
    auth: {
      name: 'Auth Service',
      baseUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      healthEndpoint: '/health',
    },
    users: {
      name: 'Users Service',
      baseUrl: process.env.USERS_SERVICE_URL || 'http://localhost:3002',
      healthEndpoint: '/health',
    },
    products: {
      name: 'Products Service',
      baseUrl: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3003',
      healthEndpoint: '/health',
    },
    orders: {
      name: 'Orders Service',
      baseUrl: process.env.ORDERS_SERVICE_URL || 'http://localhost:3004',
      healthEndpoint: '/health',
    },
    customer: {
      name: 'Customer Service',
      baseUrl: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3005',
      healthEndpoint: '/health',
    },
  };

  constructor(private readonly httpService: HttpService) {}

  /**
   * Proxy para reenviar requests a microservicios
   */
  async proxyRequest(
    serviceName: string,
    path: string,
    method: string,
    body?: any,
    headers?: Record<string, string>,
    queryParams?: any,
  ) {
    const service = this.services[serviceName];

    if (!service) {
      throw new HttpException(
        `Service ${serviceName} not found`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const url = `${service.baseUrl}${path}`;
    
    this.logger.log(
      `🔀 Proxying ${method} request to ${service.name}: ${url}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          url,
          method,
          data: body,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          params: queryParams,
        }),
      );

      return response.data;
    } catch (error) {
      this.handleProxyError(error, service.name);
    }
  }

  /**
   * Verificar salud de un microservicio
   */
  async checkServiceHealth(serviceName: string): Promise<boolean> {
    const service = this.services[serviceName];

    if (!service) {
      return false;
    }

    try {
      const url = `${service.baseUrl}${service.healthEndpoint}`;
      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 3000 }),
      );

      return response.status === 200;
    } catch (error) {
      this.logger.warn(`⚠️ Service ${service.name} is unhealthy`);
      return false;
    }
  }

  /**
   * Verificar salud de todos los servicios
   */
  async checkAllServicesHealth() {
    const healthChecks = await Promise.all(
      Object.keys(this.services).map(async (serviceName) => {
        const isHealthy = await this.checkServiceHealth(serviceName);
        return {
          service: this.services[serviceName].name,
          status: isHealthy ? 'healthy' : 'unhealthy',
          url: this.services[serviceName].baseUrl,
        };
      }),
    );

    return {
      gateway: 'healthy',
      timestamp: new Date().toISOString(),
      services: healthChecks,
    };
  }

  /**
   * Manejo centralizado de errores de proxy
   */
  private handleProxyError(error: any, serviceName: string): never {
    this.logger.error(
      `❌ Error proxying to ${serviceName}:`,
      error.message,
    );

    if (error.response) {
      // El servicio respondió con un error
      const axiosError = error as AxiosError;
      throw new HttpException(
        axiosError.response?.data || 'Service error',
        axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else if (error.code === 'ECONNREFUSED') {
      // El servicio no está disponible
      throw new HttpException(
        `Service ${serviceName} is unavailable`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else if (error.code === 'ETIMEDOUT') {
      // Timeout
      throw new HttpException(
        `Service ${serviceName} timeout`,
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }

    // Error genérico
    throw new HttpException(
      'Internal gateway error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Obtener configuración de servicios
   */
  getServicesConfig() {
    return Object.entries(this.services).map(([key, service]) => ({
      key,
      name: service.name,
      baseUrl: service.baseUrl,
    }));
  }
}
