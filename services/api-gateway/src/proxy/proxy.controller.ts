import { All, Controller, Req, Res, Logger, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Controller()
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);
  private readonly userServiceUrl: string;
  private readonly catalogServiceUrl: string;
  private readonly legacyMonolithUrl: string;
  private readonly jwtSecret: string;

  constructor(private configService: ConfigService) {
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3002';
    this.catalogServiceUrl = process.env.CATALOG_SERVICE_URL || 'http://catalog-service:3003';
    this.legacyMonolithUrl = process.env.LEGACY_MONOLITH_URL || 'http://legacy-monolith:3001';
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
  }

  @All('*')
  async proxyRequest(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const { method, url, headers, body } = req;
    
    this.logger.log(`Incoming: ${method} ${url}`);
    
    // Rutas públicas que no requieren autenticación
    const publicRoutes = [
      { method: 'POST', path: '/api/users' },        // Registro de usuarios
      { method: 'POST', path: '/api/auth/register' }, // Registro alternativo
      { method: 'POST', path: '/api/auth/login' },    // Login
      { path: '/api/docs' },                          // Swagger UI
      { path: '/api/docs-json' },                     // Swagger JSON
      { path: '/health' },                            // Health check
    ];
    
    // Verificar si la ruta es pública
    const isPublicRoute = publicRoutes.some(route => {
      const pathMatches = url.startsWith(route.path) || url === route.path;
      const methodMatches = !route.method || route.method === method;
      const matches = pathMatches && methodMatches;
      if (matches) {
        this.logger.log(`✓ Public route matched: ${method} ${url}`);
      }
      return matches;
    });
    
    this.logger.log(`Is public route: ${isPublicRoute}`);
    
    // Si no es ruta pública, verificar el token JWT
    if (!isPublicRoute) {
      const authHeader = headers.authorization as string;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.logger.warn(`✗ Unauthorized: ${method} ${url} - No valid token`);
        return res.status(401).send({ message: 'Unauthorized', statusCode: 401 });
      }
    }
    
    // Agregar headers CORS manualmente
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Manejar CORS preflight
    if (method === 'OPTIONS') {
      return res.status(204).send();
    }
    
    // Determinar el servicio destino según la ruta
    let targetService = this.legacyMonolithUrl;
    
    if (url.startsWith('/api/users') || url.startsWith('/api/auth')) {
      targetService = this.userServiceUrl;
    } else if (
      url.startsWith('/api/products') || 
      url.startsWith('/api/categories') || 
      url.startsWith('/api/ingredientes') ||
      url.startsWith('/api/producto-ingredientes')
    ) {
      targetService = this.catalogServiceUrl;
    }
    
    // Log de la petición
    this.logger.log(`${method} ${url} → ${targetService}${url}`);

    try {
      // Construir URL completa
      const targetUrl = `${targetService}${url}`;

      // Preparar headers (excluir host y connection)
      const proxyHeaders = { ...headers };
      delete proxyHeaders.host;
      delete proxyHeaders.connection;
      delete proxyHeaders['content-length'];

      // Realizar petición al servicio correspondiente
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
