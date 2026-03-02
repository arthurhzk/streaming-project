import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpException } from '@nestjs/common';
import { JwtGuard } from '@api-gateway/modules/auth/jwt.guard';
import { ProxyService } from '@api-gateway/modules/proxy/proxy.service';

type AuthedRequest = Request & { targetService?: string };

@Controller()
@UseGuards(JwtGuard)
export class ProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @All('*')
  async proxyAll(@Req() req: AuthedRequest, @Res() res: Response): Promise<void> {
    const [serviceName] = req.path.split('/').filter(Boolean);

    if (!serviceName) {
      res.status(404).json({ statusCode: 404, message: 'Not Found' });
      return;
    }

    if (!this.proxy.getServiceUrl(serviceName)) {
      res.status(404).json({ statusCode: 404, message: `Unknown service: ${serviceName}` });
      return;
    }

    req.targetService = serviceName;

    try {
      const { status, data, headers } = await this.proxy.forward(serviceName, req);
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      res.status(status).send(data);
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        res.status(err.getStatus()).json(err.getResponse());
        return;
      }

      res.status(502).json({ statusCode: 502, message: 'Bad Gateway' });
    }
  }
}
