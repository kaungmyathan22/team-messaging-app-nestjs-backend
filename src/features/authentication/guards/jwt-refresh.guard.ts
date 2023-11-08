import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export default class JwtRefreshAuthenticationGuard extends AuthGuard(
  'jwt-refresh-token',
) {}
