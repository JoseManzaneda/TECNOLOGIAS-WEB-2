import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  status: 'success';
  code: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseFormatInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => ({
        status: 'success',
        code: statusCode,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}