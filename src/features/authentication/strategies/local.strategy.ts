import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthenticationService) {
    super({ usernameField: 'email' });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.authenticate(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.verified) {
      throw new UnauthorizedException('Please verify your email first!!');
    }
    return user;
  }
}
