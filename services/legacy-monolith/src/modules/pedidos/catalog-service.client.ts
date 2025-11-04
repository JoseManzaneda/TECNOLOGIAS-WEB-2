import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

export interface ProductInfo {
  exists: boolean;
  id: number;
  nombre?: string;
  precio?: number;
  stock?: number;
  disponible?: boolean;
}

@Injectable()
export class CatalogServiceClient {
  private readonly logger = new Logger(CatalogServiceClient.name);
  private readonly catalogServiceUrl: string;
  private readonly httpClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.catalogServiceUrl = this.configService.get<string>('CATALOG_SERVICE_URL') || 'http://catalog-service:3003';
    this.httpClient = axios.create({
      baseURL: this.catalogServiceUrl,
      timeout: 5000,
    });
  }

  async getProductInfo(productId: number): Promise<ProductInfo> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const response = await this.httpClient.get<ProductInfo>(
          `/internal/products/${productId}/info`
        );
        const responseTime = Date.now() - startTime;

        this.logger.log(
          `[CatalogService] Got product ${productId} info - exists: ${response.data.exists} (${responseTime}ms)`
        );

        return response.data;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `[CatalogService] Attempt ${attempt}/${maxRetries} failed for product ${productId}: ${error.message}`
        );

        if (attempt < maxRetries) {
          // Esperar antes de reintentar (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // Si falla después de todos los intentos
    this.logger.error(
      `[CatalogService] Failed to get product ${productId} info after ${maxRetries} attempts`
    );
    throw new Error(`Unable to get product ${productId} info: ${lastError.message}`);
  }

  async validateProductsExist(productIds: number[]): Promise<Map<number, ProductInfo>> {
    const productInfoMap = new Map<number, ProductInfo>();

    // Obtener info de todos los productos en paralelo
    const promises = productIds.map(id => 
      this.getProductInfo(id).catch(error => {
        this.logger.error(`Failed to get info for product ${id}: ${error.message}`);
        return { exists: false, id } as ProductInfo;
      })
    );

    const results = await Promise.all(promises);
    
    results.forEach(info => {
      productInfoMap.set(info.id, info);
    });

    return productInfoMap;
  }
}
