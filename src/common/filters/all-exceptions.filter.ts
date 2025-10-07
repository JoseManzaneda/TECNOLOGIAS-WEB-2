import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  BadRequestException,
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
          message = 'Error de validación';
          errors = this.extractValidationErrors(responseObj.message);
        }
      }
    } else if ((exception as any)?.name === 'QueryFailedError') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Error en base de datos';
      const dbError = exception as any;
      
      // Manejar errores específicos de MySQL
      if (dbError.code === 'ER_DUP_ENTRY') {
        message = 'El registro ya existe';
      } else if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
        message = 'Referencia inválida';
      }
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