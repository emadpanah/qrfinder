import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    LoggerService,
    Logger,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  
  @Injectable()
  export class HttpLoggerInterceptor implements NestInterceptor {
    private readonly logger = new Logger(HttpLoggerInterceptor.name);
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();
  
      const start = Date.now();
      return next.handle().pipe(
        tap((data) => {
          const elapsed = Date.now() - start;
          this.logger.log({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            body: req.body,
            response: data,
            resposeTime: `${elapsed}ms`,
          });
        }),
      );
    }
  }
  