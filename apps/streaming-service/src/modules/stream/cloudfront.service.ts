import { Injectable } from '@nestjs/common';
import env from '@streaming-service/config/env';

@Injectable()
export class CloudFrontService {
  buildUrl(key: string): string {
    const base = env.CLOUDFRONT_URL.replace(/\/$/, '');
    const normalizedKey = key.startsWith('/') ? key.slice(1) : key;
    return `${base}/${normalizedKey}`;
  }
}
