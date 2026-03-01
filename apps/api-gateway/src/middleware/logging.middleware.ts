import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { createLogger } from '@repo/logger';

const logger = createLogger('api-gateway');
const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const correlationId = req.headers[CORRELATION_ID_HEADER] as string | undefined;

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const targetService = (req as Request & { targetService?: string }).targetService;
      const upstreamIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
        req.socket?.remoteAddress ??
        'unknown';

      logger.info({
        correlationId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs,
        targetService: targetService ?? '-',
        upstreamIp,
      });
    });

    next();
  }
}
