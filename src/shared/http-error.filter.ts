import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorResponse = {
            code: status,
            timestamp: new Date().toLocaleDateString(),
            path: request.url,
            methos: request.method,
            message: (status !== HttpStatus.INTERNAL_SERVER_ERROR) ? (exception.message || exception.message || null) : 'Internal server error',
        };

        if (status === HttpStatus.INTERNAL_SERVER_ERROR){
            console.error(exception);
        }

        Logger.error(
            `${request.method} ${request.url}`,
            JSON.stringify(errorResponse), 
            'ExceptionFilter',
            );

        response.status(status).json(errorResponse);
    }
}