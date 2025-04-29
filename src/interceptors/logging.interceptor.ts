import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // console log request path, method, body, query, params and headers
    const request = context.switchToHttp().getRequest();
    const timestamp = new Date().toISOString();
    const headers = {
      'user-agent': request.headers['user-agent'],
      host: request.headers['host'],
      'real-ip': request.headers['x-real-ip'],
    };
    // monitor error response
    return next.handle().pipe(
      catchError((err) => {
        this.logger.error(
          `${timestamp} => ERROR: ${err.message} | METHOD: ${request.method} | PATH: ${request.url} | BODY: ${JSON.stringify(
            request.body,
          )} | QUERY: ${JSON.stringify(request.query)} | PARAMS: ${JSON.stringify(
            request.params,
          )} | HEADERS: ${JSON.stringify(headers)}`,
        );
        throw err;
      }),
    );
  }
}
