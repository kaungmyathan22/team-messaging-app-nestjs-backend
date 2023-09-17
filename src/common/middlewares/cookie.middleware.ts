// cookie.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

@Injectable()
export class CookieMiddleware implements NestMiddleware {
  use(req, res, next) {
    // Use the cookie-parser middleware
    cookieParser()(req, res, next);
  }
}
