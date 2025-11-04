import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Permitir acceso sin autenticación a rutas de login y register
    const request = context.switchToHttp().getRequest();
    const path = request.raw.url || request.url;
    const method = request.method || request.raw.method;

    // Log para debugging
    console.log(`[JwtAuthGuard] Method: ${method}, Path: ${path}`);

    // Rutas públicas que no requieren autenticación
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/docs',       // Swagger UI
      '/api/docs-json',  // Swagger JSON spec
      '/health',
    ];
    
    // Permitir POST /api/users (registro de usuarios)
    if (method === 'POST' && (path === '/api/users' || path.startsWith('/api/users'))) {
      console.log('[JwtAuthGuard] Allowing POST /api/users');
      return true;
    }
    
    if (publicRoutes.some(route => path.includes(route))) {
      console.log(`[JwtAuthGuard] Allowing public route: ${path}`);
      return true;
    }

    return super.canActivate(context);
  }
}
