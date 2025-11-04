import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class UserServiceClient {
  private readonly logger = new Logger(UserServiceClient.name);
  private readonly client: AxiosInstance;
  private readonly userServiceUrl: string;

  constructor() {
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3002';
    this.client = axios.create({
      baseURL: this.userServiceUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Validar si un usuario existe
   * Implementa retry logic (3 intentos)
   */
  async validateUserExists(userId: number): Promise<boolean> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const response = await this.client.get(`/internal/users/${userId}/validate`);
        const responseTime = Date.now() - startTime;

        this.logger.log(
          `[UserService] Validated user ${userId} - exists: ${response.data.exists} (${responseTime}ms)`
        );

        return response.data.exists;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `[UserService] Attempt ${attempt}/${maxRetries} failed for user ${userId}: ${error.message}`
        );

        if (attempt < maxRetries) {
          // Esperar antes de reintentar (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    this.logger.error(
      `[UserService] Failed to validate user ${userId} after ${maxRetries} attempts`
    );
    throw new Error(`Unable to validate user ${userId}: ${lastError?.message || 'Unknown error'}`);
  }
}
