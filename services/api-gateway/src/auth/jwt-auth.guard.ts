import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Permitir acceso sin autenticación a rutas de login y register
    const request = context.switchToHttp().getRequest();
    const path = request.raw.url || request.url;

    // Rutas públicas que no requieren autenticación
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/docs',       // Swagger UI
      '/api/docs-json',  // Swagger JSON spec
      '/health',
    ];
    
    if (publicRoutes.some(route => path.includes(route))) {
      return true;
    }

    return super.canActivate(context);
  }
}
