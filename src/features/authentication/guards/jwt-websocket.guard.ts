import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtWebSocketGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.query.token;

    if (!token) {
      return false;
    }
    try {
      const decoded = this.jwtService.verify(token);
      client.user = decoded;
      return true;
    } catch (error) {
      return false;
    }
  }
}
