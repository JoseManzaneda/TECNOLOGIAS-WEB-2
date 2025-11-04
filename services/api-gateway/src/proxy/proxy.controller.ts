import { All, Controller, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import axios from 'axios';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);
  private readonly legacyMonolithUrl: string;

  constructor() {
    this.legacyMonolithUrl = process.env.LEGACY_MONOLITH_URL || 'http://legacy-monolith:3001';
  }

  @All('*')
  async proxyRequest(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const { method, url, headers, body } = req;
    
    // Agregar headers CORS manualmente
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Manejar CORS preflight
    if (method === 'OPTIONS') {
      return res.status(204).send();
    }
    
    // Log de la petición
    this.logger.log(`${method} ${url} → ${this.legacyMonolithUrl}${url}`);

    try {
      // Construir URL completa
      const targetUrl = `${this.legacyMonolithUrl}${url}`;

      // Preparar headers (excluir host y connection)
      const proxyHeaders = { ...headers };
      delete proxyHeaders.host;
      delete proxyHeaders.connection;
      delete proxyHeaders['content-length'];

      // Realizar petición al monolito
      const response = await axios({
        method: method.toLowerCase() as any,
        url: targetUrl,
        headers: proxyHeaders,
        data: body,
        validateStatus: () => true, // Aceptar todos los códigos de estado
      });

      // Reenviar headers de respuesta
      Object.entries(response.headers).forEach(([key, value]) => {
        res.header(key, value as string);
      });

      // Enviar respuesta
      res.status(response.status).send(response.data);
    } catch (error: any) {
      this.logger.error(`Error proxying request to ${url}:`, error?.message || error);
      
      res.status(500).send({
        statusCode: 500,
        message: 'Error al comunicarse con el servicio',
        error: 'Internal Server Error',
      });
    }
  }
}
