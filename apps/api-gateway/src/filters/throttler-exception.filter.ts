import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const status =
      exception &&
      typeof exception === 'object' &&
      'getStatus' in exception &&
      typeof (exception as { getStatus: () => number }).getStatus === 'function'
        ? (exception as { getStatus: () => number }).getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      res.status(status).json({
        statusCode: 429,
        message: 'Too many requests',
      });
      return;
    }

    const message =
      exception && typeof exception === 'object' && 'getResponse' in exception
        ? (exception as { getResponse: () => unknown }).getResponse()
        : 'Internal server error';

    res
      .status(status)
      .json(
        typeof message === 'object' && message !== null
          ? message
          : { statusCode: status, message: String(message) },
      );
  }
}
