import {
  Controller,
  All,
  Req,
  Res,
  Logger,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { getAuth } from './auth.provider';

/**
 * Better Auth controller.
 *
 * Mounts the Better Auth web handler at /api/v1/auth/*. The handler expects a
 * standard Web `Request`, so the Express request is translated instead of being
 * passed through: better-call parses `request.url` with `new URL()`, which
 * throws on a relative path.
 */
@Controller('auth')
export class BetterAuthController {
  private readonly logger = new Logger(BetterAuthController.name);

  @All('*')
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ): Promise<void> {
    const betterAuthUrl = req.originalUrl.replace('/api/v1/auth', '/api/auth');
    const origin = `${req.protocol}://${req.get('host')}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        for (const item of value) headers.append(key, item);
      } else if (value !== undefined) {
        headers.set(key, value);
      }
    }

    const init: RequestInit = { method: req.method, headers };
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.rawBody) {
      init.body = new Uint8Array(req.rawBody);
    }

    try {
      const response = await getAuth().handler(
        new Request(new URL(betterAuthUrl, origin), init),
      );

      res.status(response.status);
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'set-cookie') {
          res.setHeader(key, value);
        }
      });

      const cookies = response.headers.getSetCookie?.() ?? [];
      if (cookies.length > 0) {
        res.setHeader('set-cookie', cookies);
      }

      res.send(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      this.logger.error('Better Auth handler error', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal authentication error' });
      }
    }
  }
}
