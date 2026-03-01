import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtGuard } from '@api-gateway/modules/auth/jwt.guard';
import { ProxyService } from '@api-gateway/modules/proxy/proxy.service';

@Controller()
@UseGuards(JwtGuard)
export class ProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @All('*')
  async proxyAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const path = req.path;
    const segments = path.split('/').filter(Boolean);
    const serviceName = segments[0];

    if (!serviceName) {
      res.status(404).json({
        statusCode: 404,
        message: 'Not Found',
      });
      return;
    }

    const baseUrl = this.proxy.getServiceUrl(serviceName);
    if (!baseUrl) {
      res.status(404).json({
        statusCode: 404,
        message: `Unknown service: ${serviceName}`,
      });
      return;
    }

    (req as Request & { targetService?: string }).targetService = serviceName;

    try {
      const { status, data, headers } = await this.proxy.forward(serviceName, req);
      res.status(status);
      for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value);
      }
      res.send(data);
    } catch (err: unknown) {
      const httpErr = err as { getStatus?: () => number; getResponse?: () => unknown };
      if (httpErr?.getStatus && typeof httpErr.getStatus === 'function') {
        const status = httpErr.getStatus();
        const response =
          typeof httpErr.getResponse === 'function' ? httpErr.getResponse() : undefined;
        res
          .status(status)
          .json(
            typeof response === 'object' && response !== null
              ? response
              : { statusCode: status, message: 'Service unavailable' },
          );
      } else {
        res.status(502).json({
          statusCode: 502,
          message: 'Bad Gateway',
        });
      }
    }
  }
}
