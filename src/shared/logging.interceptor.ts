import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { nextTick } from 'process';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(
       context: ExecutionContext,
       next: CallHandler<any>,
    ): Observable<any>{
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const url = req.url;
        const now = Date.now;

        return next.handle().pipe(
            tap(() => 
                Logger.log(
                    `${method} ${url} ${Date.now() }ms`,
                    // Should be statement below (including '- now'), but 'now' gives errors
                    // `${method} ${url} ${Date.now() - now}ms`,
                    context.getClass().name,
                ),
            ),
        );
    }
}