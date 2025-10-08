import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: Array<{ field: string; message: string }> = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object') {
        const responseObj: any = response;
        message = responseObj.message || message;
        
        // Manejar errores de validación de class-validator
        if (Array.isArray(responseObj.message)) {
          message = 'Errores de validación encontrados';
          errors = this.extractValidationErrors(responseObj.message);
        }
      }

      // Mensajes específicos por tipo de excepción
      if (exception instanceof BadRequestException) {
        message = message || 'Solicitud incorrecta';
      } else if (exception instanceof UnauthorizedException) {
        message = message || 'No autorizado - token requerido o inválido';
      } else if (exception instanceof ForbiddenException) {
        message = message || 'Acceso prohibido - permisos insuficientes';
      } else if (exception instanceof NotFoundException) {
        message = message || 'Recurso no encontrado';
      } else if (exception instanceof ConflictException) {
        message = message || 'Conflicto con el estado actual del recurso';
      }
    } else if ((exception as any)?.name === 'QueryFailedError') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Error en la base de datos';
      const dbError = exception as any;
      
      // Manejar errores específicos de MySQL
      if (dbError.code === 'ER_DUP_ENTRY') {
        message = 'Ya existe un registro con esa información';
      } else if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
        message = 'Referencia inválida - el registro relacionado no existe';
      } else if (dbError.code === 'ER_ROW_IS_REFERENCED_2') {
        message = 'No se puede eliminar - el registro está siendo usado por otros elementos';
      }
    } else {
      // Error no esperado
      console.error('Error no capturado:', exception);
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Error interno del servidor';
    }

    const responseBody = {
      status: 'error',
      code: status,
      message,
      ...(errors.length > 0 && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    reply.status(status).send(responseBody);
  }

  private extractValidationErrors(validationErrors: any[]): Array<{ field: string; message: string }> {
    const errors: Array<{ field: string; message: string }> = [];
    
    validationErrors.forEach((error) => {
      if (error instanceof ValidationError) {
        const constraints = error.constraints;
        if (constraints) {
          Object.values(constraints).forEach((constraint: string) => {
            errors.push({
              field: error.property,
              message: constraint,
            });
          });
        }
      } else if (typeof error === 'string') {
        errors.push({
          field: 'general',
          message: error,
        });
      }
    });
    
    return errors;
  }
}