import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: any = {
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message: 'Error interno del servidor',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        responseBody.message = res;
      } else if (typeof res === 'object') {
        const obj: any = res;
        responseBody = { ...responseBody, ...obj };
      }
    } else if (
      Array.isArray((exception as any)?.message) &&
      (exception as any).message[0] instanceof ValidationError
    ) {
      status = HttpStatus.BAD_REQUEST;
      responseBody.message = 'Error de validación';
      responseBody.errors = (exception as any).message.map((e: ValidationError) => ({
        property: e.property,
        constraints: e.constraints,
      }));
    } else if ((exception as any)?.name === 'QueryFailedError') {
      status = HttpStatus.BAD_REQUEST;
      responseBody.message = 'Error en base de datos';
      responseBody.detail = (exception as any).message;
    }

    responseBody.statusCode = status;
    reply.status(status).send(responseBody);
  }
}