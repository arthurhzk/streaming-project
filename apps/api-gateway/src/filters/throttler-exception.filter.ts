import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    let status: number;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      res.status(status).json({
        statusCode: 429,
        message: 'Too many requests',
      });
      return;
    }

    let message: unknown;
    if (exception instanceof HttpException) {
      message = exception.getResponse();
    } else {
      message = 'Internal server error';
    }

    let body: object;
    if (typeof message === 'object' && message !== null) {
      body = message;
    } else {
      body = { statusCode: status, message: String(message) };
    }

    res.status(status).json(body);
  }
}
